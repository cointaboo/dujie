#!/usr/bin/env python3
"""内容管线：校验 + 统计 + 生成合并文件"""
import json, os, re, sys, glob

D = os.path.dirname(os.path.abspath(__file__))
S = os.path.dirname(D)  # shanmen/

def read(p):
    return open(p, encoding='utf-8').read()

def main():
    files = sorted(glob.glob(os.path.join(D, 'batch_*.js')))
    total = 0
    ids = []
    report = []
    for f in files:
        txt = read(f)
        # 粗校验：必须是 Object.assign(DEEP_NODES, {...}) 或 const PLOT_BATCH = [...]
        if 'PLOT' not in txt:
            report.append((os.path.basename(f), 'SKIP (no PLOT)'))
            continue
        # 统计中文字符
        cn = len(re.findall(r'[\u4e00-\u9fa5]', txt))
        total += cn
        # 提 id
        ids += re.findall(r"id:'([a-z0-9_]+)'", txt)
        report.append((os.path.basename(f), f'{cn} 字'))
    dup = [i for i in set(ids) if ids.count(i) > 1]
    print('文件统计：')
    for n, c in report:
        print(f'  {n:24s} {c}')
    print(f'批次总中文字数：{total}')
    print(f'节点数：{len(ids)}  重复 id：{dup if dup else "无"}')

if __name__ == '__main__':
    main()
