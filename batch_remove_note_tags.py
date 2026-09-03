#!/usr/bin/env python3
import os
import subprocess

def batch_remove_note_tags():
    """
    批量处理blog目录下的所有md文件，移除其中的note标签
    """
    # 定义blog目录路径
    blog_dir = os.path.join('src', 'content', 'blog')
    
    # 检查blog目录是否存在
    if not os.path.exists(blog_dir):
        print(f"错误: 目录 '{blog_dir}' 不存在")
        return
    
    # 获取blog目录下的所有md文件
    md_files = [f for f in os.listdir(blog_dir) if f.endswith('.md')]
    
    if not md_files:
        print(f"错误: 目录 '{blog_dir}' 中没有找到md文件")
        return
    
    print(f"找到 {len(md_files)} 个md文件，开始处理...")
    
    # 处理每个md文件
    for md_file in md_files:
        file_path = os.path.join(blog_dir, md_file)
        print(f"处理文件: {md_file}")
        
        # 调用remove_note_tags.py脚本处理文件
        try:
            result = subprocess.run(
                ['python', 'remove_note_tags.py', file_path],
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                print(f"  ✓ 处理成功")
            else:
                print(f"  ✗ 处理失败: {result.stderr}")
        except Exception as e:
            print(f"  ✗ 处理失败: {e}")
    
    print(f"\n处理完成，共处理了 {len(md_files)} 个文件")

if __name__ == "__main__":
    batch_remove_note_tags()
