/**
 * 移除标题上的锚点井号链接（a.anchor / .anchor-icon）。
 * rehype-autolink-headings 已从配置卸除；本插件兜底清掉残留节点。
 */
import { visit } from "unist-util-visit";

function hasAnchorClass(node) {
	const cls = node.properties?.className;
	if (!cls) return false;
	const list = Array.isArray(cls) ? cls : String(cls).split(/\s+/);
	return list.includes("anchor") || list.includes("anchor-icon");
}

export function rehypeStripHeadingAnchors() {
	return (tree) => {
		visit(tree, "element", (node, index, parent) => {
			if (index == null || !parent) return;
			if (
				(node.tagName === "a" || node.tagName === "span") &&
				hasAnchorClass(node)
			) {
				parent.children.splice(index, 1);
				return index;
			}
		});
	};
}
