const USER_ID = "aadityakumar_18052005";
const EMAIL_ID = "aaditya1003.be23@chitkarauniversity.edu.in";
const COLLEGE_ROLL_NUMBER = "2311981003";

function processData(data) {
  const invalidEntries = [];
  const duplicateEdges = [];
  const validEdges = [];
  const seenEdges = new Set();

  // Step 1: Validate entries and deduplicate
  for (const entry of data) {
    if (typeof entry !== "string") {
      invalidEntries.push(String(entry));
      continue;
    }

    const trimmed = entry.trim();

    // Validate format: exactly one uppercase letter, "->", one uppercase letter
    const match = trimmed.match(/^([A-Z])->([A-Z])$/);

    if (!match) {
      invalidEntries.push(trimmed);
      continue;
    }

    const parent = match[1];
    const child = match[2];

    // Self-loop is invalid
    if (parent === child) {
      invalidEntries.push(trimmed);
      continue;
    }

    const edgeKey = `${parent}->${child}`;

    // Duplicate check
    if (seenEdges.has(edgeKey)) {
      if (!duplicateEdges.includes(edgeKey)) {
        duplicateEdges.push(edgeKey);
      }
      continue;
    }

    seenEdges.add(edgeKey);
    validEdges.push({ parent, child, key: edgeKey });
  }

  // Step 2: Build graph with multi-parent handling
  const childToParent = {};
  const parentToChildren = {};
  const keptEdges = [];

  for (const edge of validEdges) {
    // If child already has a parent, silently discard
    if (childToParent[edge.child] !== undefined) {
      continue;
    }

    childToParent[edge.child] = edge.parent;

    if (!parentToChildren[edge.parent]) {
      parentToChildren[edge.parent] = [];
    }
    parentToChildren[edge.parent].push(edge.child);
    keptEdges.push(edge);
  }

  // Collect all nodes from kept edges only
  const allNodes = new Set();
  for (const edge of keptEdges) {
    allNodes.add(edge.parent);
    allNodes.add(edge.child);
  }

  // Step 3: Find connected components via BFS on undirected adjacency
  const adj = {};
  for (const node of allNodes) {
    adj[node] = new Set();
  }
  for (const edge of keptEdges) {
    adj[edge.parent].add(edge.child);
    adj[edge.child].add(edge.parent);
  }

  const visited = new Set();
  const components = [];

  for (const node of allNodes) {
    if (visited.has(node)) continue;

    const component = [];
    const queue = [node];
    visited.add(node);

    while (queue.length > 0) {
      const current = queue.shift();
      component.push(current);

      for (const neighbor of adj[current]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    components.push(component);
  }

  // Step 4: Process each component into a hierarchy object
  const hierarchies = [];

  for (const component of components) {
    // Find root: node that never appears as a child
    const roots = component.filter((n) => childToParent[n] === undefined);

    if (roots.length === 0) {
      // Pure cycle — all nodes appear as children
      const sorted = [...component].sort();
      hierarchies.push({
        root: sorted[0],
        tree: {},
        has_cycle: true,
      });
    } else {
      const root = roots[0];

      // Build nested tree object
      const buildTree = (node) => {
        const children = (parentToChildren[node] || []).slice().sort();
        const obj = {};
        for (const child of children) {
          obj[child] = buildTree(child);
        }
        return obj;
      };

      const tree = {};
      tree[root] = buildTree(root);

      // Calculate depth (number of nodes on longest root-to-leaf path)
      const calcDepth = (node) => {
        const children = parentToChildren[node] || [];
        if (children.length === 0) return 1;
        return 1 + Math.max(...children.map(calcDepth));
      };

      const depth = calcDepth(root);

      hierarchies.push({ root, tree, depth });
    }
  }

  // Step 5: Build summary
  const trees = hierarchies.filter((h) => !h.has_cycle);
  const cycles = hierarchies.filter((h) => h.has_cycle);

  let largestTreeRoot = "";
  let maxDepth = 0;

  for (const t of trees) {
    if (
      t.depth > maxDepth ||
      (t.depth === maxDepth && t.root < largestTreeRoot)
    ) {
      maxDepth = t.depth;
      largestTreeRoot = t.root;
    }
  }

  return {
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: COLLEGE_ROLL_NUMBER,
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary: {
      total_trees: trees.length,
      total_cycles: cycles.length,
      largest_tree_root: largestTreeRoot,
    },
  };
}

module.exports = processData;
