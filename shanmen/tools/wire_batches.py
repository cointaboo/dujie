#!/usr/bin/env python3
"""自动把 shanmen/batch_*.js 接进 index.html（script 标签 + ALLPLOT 合并）"""
import glob, os, re, subprocess, sys

S = '/root/demo-dujie-v4/shanmen'
IDX = os.path.join(S, 'index.html')

files = sorted(glob.glob(os.path.join(S, 'batch_*.js')))
batches = [os.path.basename(f).replace('.js', '') for f in files]
html = open(IDX, encoding='utf-8').read()

# 1) script 标签
tags = ''.join(f'<script src="{b}.js?v=1"></script>\n' for b in batches)
start = html.find('<script src="batch_a.js')
if start == -1:
    anchor = html.find('<script src="seasons2.js')
    end = html.find('</script>', anchor) + len('</script>\n')
    html = html[:end] + tags + html[end:]
else:
    # 找到最后一个 batch script 行结束位置，替换整段
    last = max(html.find(f'<script src="{b}.js') for b in batches)
    end = html.find('\n', last) + 1
    html = html[:start] + tags + html[end:]

# 2) ALLPLOT 合并：把 ...(typeof PLOTB_x!=='undefined'?PLOTB_x:[]) 全部重建
pattern = re.compile(r"\.\.\.\(typeof PLOTB_[a-z]+!=='undefined'\?PLOTB_[a-z]+:\[\]\)(,\s*)?")
merge = ', '.join(f"...(typeof PLOTB_{b.split('_')[1]}!=='undefined'?PLOTB_{b.split('_')[1]}:[])" for b in batches)
if pattern.search(html):
    html = pattern.sub('', html)
    # 在 PLOT12 后插入
    m = re.search(r"(PLOT10, PLOT11, PLOT12)", html)
    if m:
        html = html.replace(m.group(1), m.group(1) + ', ' + merge, 1)
else:
    m = re.search(r"(PLOT10, PLOT11, PLOT12)", html)
    html = html.replace(m.group(1), m.group(1) + ', ' + merge, 1)

open(IDX, 'w', encoding='utf-8').write(html)

# 3) 校验内联脚本语法
src = html[html.rindex('<script>') + 8: html.rindex('</script>')]
open('/tmp/_inline.js', 'w').write(src)
r = subprocess.run(['node', '--check', '/tmp/_inline.js'], capture_output=True, text=True)
print('batches wired:', len(batches), batches)
print('syntax:', 'OK' if r.returncode == 0 else r.stderr[:300])
