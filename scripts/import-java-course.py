#!/usr/bin/env python3
"""
import-java-course.py — 把小红书课程体系批量转换为 Firefly 博客文章。

用法：
    python scripts/import-java-course.py            # 正式执行
    python scripts/import-java-course.py --dry-run  # 只打印不写入

源目录：D:\\OneDrive\\Desktop\\project\\xiaohongshu\\reference_docs
输出目录：src/content/posts/<slug>/index.md
"""

import argparse
import re
import shutil
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# 路径常量（Windows 绝对路径，脚本从 Firefly 根目录运行）
# ---------------------------------------------------------------------------
FIREFLY_ROOT = Path(__file__).resolve().parent.parent  # scripts/ 的上一级
SOURCE_DOCS = Path(r"D:\OneDrive\Desktop\project\xiaohongshu\reference_docs\docs")
SOURCE_IMAGES = Path(r"D:\OneDrive\Desktop\project\xiaohongshu\reference_docs\images")
OUTPUT_DIR = FIREFLY_ROOT / "src" / "content" / "posts"

# ---------------------------------------------------------------------------
# 课程 → 子合集映射
# ---------------------------------------------------------------------------
COURSE_COLLECTION_MAP: dict[int, str] = {
    0: "java-fullstack-intro",
    1: "java-fullstack-intro",
    2: "java-fullstack-spring",
    3: "java-fullstack-spring",
    5: "java-fullstack-spring",
    6: "java-fullstack-spring",
    4: "java-fullstack-frontend-basic",
    7: "java-fullstack-frontend-basic",
    8: "java-fullstack-monolith",
    **{i: "java-fullstack-distributed" for i in range(9, 17)},
    **{i: "java-fullstack-microservices" for i in range(17, 22)},
    **{i: "java-fullstack-ai-cloud" for i in range(22, 28)},
}

# ---------------------------------------------------------------------------
# 课程 → 标签映射
# ---------------------------------------------------------------------------
COURSE_TAGS_MAP: dict[int, list[str]] = {
    0: ["Java", "全栈", "导学"],
    1: ["Java", "全栈", "导学"],
    2: ["Java", "Spring", "IoC", "AOP"],
    3: ["Java", "Spring MVC", "Web"],
    4: ["Java", "Thymeleaf", "模板引擎"],
    5: ["Java", "Spring Data", "JPA", "MongoDB"],
    6: ["Java", "Spring Security", "安全"],
    7: ["Bootstrap", "CSS", "前端"],
    8: ["Java", "Spring Boot", "实战", "小红书"],
    9: ["分布式", "CAP", "架构"],
    10: ["Git", "版本控制"],
    11: ["Redis", "缓存"],
    12: ["Kafka", "消息队列"],
    13: ["MongoDB", "NoSQL"],
    14: ["Nginx", "反向代理"],
    15: ["Prometheus", "监控", "Grafana"],
    16: ["分布式", "实战", "演进"],
    17: ["Vue", "前端", "JavaScript"],
    18: ["Vue", "前后端分离", "实战"],
    19: ["微服务", "架构设计"],
    20: ["Spring Cloud", "微服务", "Nacos"],
    21: ["微服务", "实战", "改造"],
    22: ["Spring AI", "AI", "人工智能"],
    23: ["AI", "实战", "融合"],
    24: ["Docker", "容器化"],
    25: ["Docker", "容器化", "部署"],
    26: ["Kubernetes", "K8s", "编排"],
    27: ["Kubernetes", "K8s", "部署"],
}

# ---------------------------------------------------------------------------
# 已知重复 / 废弃文件（相对路径，统一用正斜杠）
# ---------------------------------------------------------------------------
SKIP_FILES: set[str] = {
    "course20/ch3/3-6.md",
    "course20/ch3/3-7.md",
    "course20/ch3/3-8.md",
    "course20/ch5/5-4.md",
    "course22/ch3/3-4.md",
}

# ---------------------------------------------------------------------------
# 营销 / AI 痕迹正则
# ---------------------------------------------------------------------------
# 夸张数字：提升效率200%、降低90%、提升 300% 等（允许中间有空格）
RE_HYPE_NUMBER = re.compile(r"(?:提升|提高|降低|减少|节省)\s*\S*\d+%")
# 填充句：本章节，全面讲解… / 本章将… / 以下是详细分析 / 以下是基于…
RE_FILLER = re.compile(
    r"^(?:本章节?[，,]?\s*全面讲解|本章将|以下是详细分析|以下是基于|接下来[，,]?\s*我们将)"
)
# AI 痕迹短语
RE_AI_TRACE = re.compile(
    r"(?:以下是详细分析|以下是基于|让我们深入|综上所述[，,]?\s*可以?看出|"
    r"希望?本文|希望?对(?:您|你)|如果(?:您|你)觉得)"
)

# 图片路径：../../../images/courseN/chM/x-y.png → ./images/x-y.png
RE_IMAGE_SRC = re.compile(
    r"!\[([^\]]*)\]\((?:\.\./)+images/(course\d+)/(ch\d+)/([^)]+)\)"
)

# 标题粗体：### **xxx** → ### xxx；#### 1. **xxx** → #### 1. xxx
RE_HEADING_BOLD = re.compile(r"^(#{1,6}\s+(?:[\d.]+\s*)?)\*\*(.+?)\*\*\s*$", re.MULTILINE)
# 列表项粗体：- **xxx**：→ - xxx：；- **xxx**: → - xxx:
RE_LIST_BOLD = re.compile(r"^(\s*[-*+]\s+)\*\*(.+?)\*\*([：:])", re.MULTILINE)
# 行内残留粗体：**xxx** → xxx（在正文中，非标题非列表的粗体）
RE_INLINE_BOLD = re.compile(r"(?<!\*)\*\*(?!\*)(.+?)(?<!\*)\*\*(?!\*)")

# 连续 3+ 空行 → 2 个
RE_MULTI_BLANK = re.compile(r"\n{4,}")


def scan_articles() -> list[Path]:
    """扫描源目录下所有 x-y.md 格式的节文章，跳过纯数字命名的章首页。"""
    pattern = re.compile(r"^\d+-\d+\.md$")
    results: list[Path] = []
    for md in sorted(SOURCE_DOCS.rglob("*.md")):
        if pattern.match(md.name):
            results.append(md)
    return results


def parse_course_info(md_path: Path) -> tuple[int, int, str]:
    """从路径解析 courseN、chM、文件名（不含扩展名）。"""
    # 相对路径形如 course2/ch2/2-1.md
    rel = md_path.relative_to(SOURCE_DOCS)
    parts = rel.parts  # ('course2', 'ch2', '2-1.md')
    course_num = int(parts[0].replace("course", ""))
    ch_num = int(parts[1].replace("ch", ""))
    stem = md_path.stem  # '2-1'
    return course_num, ch_num, stem


def make_slug(course_num: int, stem: str) -> str:
    """生成 slug：java-course{N}-{章节号}，如 java-course2-2-2。"""
    return f"java-course{course_num}-{stem}"


def _clean_text(text: str) -> str:
    """清洗文本中的 AI 痕迹和营销措辞。"""
    # 删除营销数字
    text = RE_HYPE_NUMBER.sub("", text)
    # 删除 AI 痕迹短语
    text = RE_AI_TRACE.sub("", text)
    # 删除填充句
    text = RE_FILLER.sub("", text)
    # 清理多余空格
    text = re.sub(r"  +", " ", text).strip()
    # 删除末尾的冒号（如果是被截断的引导句）
    if text.endswith("：") or text.endswith(":"):
        text = text[:-1].strip()
    return text


def extract_title(content: str) -> str:
    """从文章第一行 ## 标题提取，去掉开头的编号如 '2.2 '。"""
    for line in content.splitlines():
        line = line.strip()
        if line.startswith("## "):
            title = line[3:].strip()
            # 去掉开头的编号，如 "2.2 " 或 "2.2.1 "
            title = re.sub(r"^[\d.]+\s*", "", title)
            return _clean_text(title)
        if line.startswith("# ") and not line.startswith("## "):
            title = line[2:].strip()
            title = re.sub(r"^[\d.]+\s*", "", title)
            return _clean_text(title)
    return "未命名"


def extract_description(content: str, max_len: int = 100) -> str:
    """从文章第一段提取描述，截取前 max_len 字。"""
    lines = content.splitlines()
    in_heading = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("#"):
            in_heading = True
            continue
        if in_heading and stripped:
            # 去掉 Markdown 格式符号
            text = re.sub(r"[*_`\[\]()!#>]", "", stripped)
            text = _clean_text(text)
            if not text:
                continue
            if len(text) > max_len:
                return text[:max_len] + "…"
            return text
        if not in_heading and stripped:
            # 还没遇到标题就遇到正文，直接用
            text = re.sub(r"[*_`\[\]()!#>]", "", stripped)
            text = _clean_text(text)
            if not text:
                continue
            if len(text) > max_len:
                return text[:max_len] + "…"
            return text
    return ""


def clean_content(content: str) -> str:
    """内容清洗（humanizer-zh 规则自动化）。"""
    lines = content.splitlines()
    cleaned: list[str] = []
    title_removed = False

    for line in lines:
        stripped = line.strip()

        # 1. 删除原始标题行（第一个 # 或 ## 标题，因为 frontmatter 已有 title）
        if not title_removed and stripped.startswith("#"):
            title_removed = True
            continue

        # 2. 删除营销化措辞
        if RE_HYPE_NUMBER.search(stripped):
            continue

        # 3. 删除填充句
        if RE_FILLER.search(stripped):
            continue

        # 4. 删除 AI 痕迹
        if RE_AI_TRACE.search(stripped):
            continue

        # 5. 删除 --- 分割线（frontmatter 之后正文中的 ---）
        if stripped == "---":
            continue

        cleaned.append(line)

    text = "\n".join(cleaned)

    # 6. 修复图片路径
    text = RE_IMAGE_SRC.sub(r"![\1](./images/\4)", text)

    # 7. 删除标题中的 ** 粗体标记
    text = RE_HEADING_BOLD.sub(r"\1\2", text)

    # 8. 删除列表项的 ** 粗体标记
    text = RE_LIST_BOLD.sub(r"\1\2\3", text)

    # 8.5 删除行内残留粗体（正文中非标题非列表的 **xxx**）
    # 注意：不处理代码块内的内容
    lines_final = text.split("\n")
    in_code_block = False
    for i, ln in enumerate(lines_final):
        if ln.strip().startswith("```"):
            in_code_block = not in_code_block
            continue
        if not in_code_block:
            lines_final[i] = RE_INLINE_BOLD.sub(r"\1", ln)
    text = "\n".join(lines_final)

    # 9. 压缩连续空行
    text = RE_MULTI_BLANK.sub("\n\n\n", text)

    # 去掉首尾多余空行
    text = text.strip()

    return text


def _yaml_escape(s: str) -> str:
    """转义 YAML 双引号字符串中的特殊字符。"""
    return s.replace("\\", "\\\\").replace('"', '\\"')


def build_frontmatter(
    title: str,
    description: str,
    tags: list[str],
    slug: str,
    sub_collection: str,
) -> str:
    """生成 YAML frontmatter。"""
    safe_title = _yaml_escape(title)
    safe_desc = _yaml_escape(description)
    tags_str = ", ".join(tags)
    return (
        f"---\n"
        f'title: "{safe_title}"\n'
        f"published: 2026-08-25\n"
        f'description: "{safe_desc}"\n'
        f"image: ''\n"
        f"tags: [{tags_str}]\n"
        f"category: 指南\n"
        f"collections: [java-fullstack, {sub_collection}]\n"
        f"draft: false\n"
        f"lang: ''\n"
        f"slug: {slug}\n"
        f"pinned: false\n"
        f"comment: true\n"
        f"---\n"
    )


def copy_images(
    course_num: int, ch_num: int, cleaned_content: str, post_dir: Path, dry_run: bool
) -> int:
    """把文章实际引用的图片文件复制到文章目录的 images/ 子目录下。返回复制数量。"""
    src_img_dir = SOURCE_IMAGES / f"course{course_num}" / f"ch{ch_num}"
    if not src_img_dir.is_dir():
        return 0

    # 从清洗后的内容中提取实际引用的图片文件名
    # 清洗后图片路径已转为 ./images/xxx.png
    referenced = re.findall(r"!\[.*?\]\(\./images/([^)]+)\)", cleaned_content)
    if not referenced:
        return 0

    dst_img_dir = post_dir / "images"
    count = 0
    for img_name in referenced:
        src = src_img_dir / img_name
        if not src.is_file():
            continue
        dst = dst_img_dir / img_name
        if not dry_run:
            dst_img_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
        count += 1
    return count


def process_article(md_path: Path, dry_run: bool) -> tuple[bool, int]:
    """
    处理单篇文章。
    返回 (是否成功, 复制图片数)。
    """
    rel = md_path.relative_to(SOURCE_DOCS)
    rel_str = str(rel).replace("\\", "/")

    # 去重检查
    if rel_str in SKIP_FILES:
        print(f"  SKIP (duplicate/deprecated): {rel_str}")
        return False, 0

    course_num, ch_num, stem = parse_course_info(md_path)

    # 检查课程映射
    if course_num not in COURSE_COLLECTION_MAP:
        print(f"  SKIP (no collection mapping): {rel_str}")
        return False, 0

    slug = make_slug(course_num, stem)
    sub_collection = COURSE_COLLECTION_MAP[course_num]
    tags = COURSE_TAGS_MAP.get(course_num, ["Java", "全栈"])

    # 读取源文件
    content = md_path.read_text(encoding="utf-8")

    # 提取元数据
    title = extract_title(content)
    description = extract_description(content)

    # 清洗内容
    cleaned = clean_content(content)

    # 生成 frontmatter
    frontmatter = build_frontmatter(title, description, tags, slug, sub_collection)

    # 组装最终文件
    final = frontmatter + "\n" + cleaned + "\n"

    # 输出目录
    post_dir = OUTPUT_DIR / slug
    post_file = post_dir / "index.md"

    if dry_run:
        print(f"  DRY-RUN: {rel_str} -> {slug}/index.md  (title: {title})")
    else:
        post_dir.mkdir(parents=True, exist_ok=True)
        post_file.write_text(final, encoding="utf-8")
        print(f"  OK: {rel_str} -> {slug}/index.md")

    # 复制图片（只复制文章实际引用的）
    img_count = copy_images(course_num, ch_num, cleaned, post_dir, dry_run)
    if img_count > 0:
        print(f"    images: {img_count} copied")

    return True, img_count


def main() -> None:
    parser = argparse.ArgumentParser(
        description="把小红书课程体系批量转换为 Firefly 博客文章"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="只打印不写入",
    )
    args = parser.parse_args()

    # 前置检查
    if not SOURCE_DOCS.is_dir():
        print(f"ERROR: 源目录不存在: {SOURCE_DOCS}", file=sys.stderr)
        sys.exit(1)

    articles = scan_articles()
    print(f"扫描到 {len(articles)} 篇节文章\n")

    processed = 0
    skipped = 0
    total_images = 0

    for md in articles:
        ok, img_count = process_article(md, args.dry_run)
        if ok:
            processed += 1
            total_images += img_count
        else:
            skipped += 1

    print(f"\n{'[DRY-RUN] ' if args.dry_run else ''}完成：")
    print(f"  处理: {processed} 篇")
    print(f"  跳过: {skipped} 篇")
    print(f"  图片: {total_images} 张")


if __name__ == "__main__":
    main()
