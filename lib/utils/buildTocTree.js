export function buildTocTree(headings) {
  const stack = [];
  const tree = [];

  headings.forEach((h) => {
    const node = { ...h, children: [] };

    while (stack.length && stack.at(-1).level >= node.level) {
      stack.pop();
    }

    if (stack.length) {
      stack.at(-1).children.push(node);
    } else {
      tree.push(node);
    }

    stack.push(node);
  });

  return tree;
}
