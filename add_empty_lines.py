#!/usr/bin/env python3
import sys
import os

def add_empty_lines(input_file, output_file=None):
    """
    在md文件的每一行之间添加空行
    :param input_file: 输入文件路径
    :param output_file: 输出文件路径，默认为None（覆盖原文件）
    """
    # 读取文件内容
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"读取文件失败: {e}")
        return
    
    # 处理每一行，在它们之间添加空行
    processed_lines = []
    for line in lines:
        processed_lines.append(line)
        # 如果不是最后一行，添加空行
        if line != lines[-1]:
            processed_lines.append('\n')
    
    # 确定输出文件路径
    if output_file is None:
        output_file = input_file
    
    # 写入处理后的内容
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.writelines(processed_lines)
        print(f"处理完成，结果已保存到: {output_file}")
    except Exception as e:
        print(f"写入文件失败: {e}")
        return

if __name__ == "__main__":
    # 检查命令行参数
    if len(sys.argv) < 2:
        print("用法: python add_empty_lines.py <input_file> [output_file]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    # 检查输入文件是否存在
    if not os.path.exists(input_file):
        print(f"错误: 文件 '{input_file}' 不存在")
        sys.exit(1)
    
    # 执行处理
    add_empty_lines(input_file, output_file)
