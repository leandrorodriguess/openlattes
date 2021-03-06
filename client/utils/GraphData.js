class GraphData {
  constructor({ nodes, edges }) {
    this.nodes = nodes;
    this.edges = edges;
  }

  extractGroup() {
    return [...this.nodes
      .reduce((set, { groups }) => new Set([...set, ...groups]), new Set())];
  }

  extractProductionTypes() {
    return [...this.edges
      .reduce((set, { productions }) => {
        const all = productions.map(({ type }) => type);

        return new Set([...set, ...all]);
      }, new Set())];
  }

  filterByGroup(match) {
    if (match && match !== 'Todos') {
      const filteredNodes = this.nodes
        .filter(({ groups }) => groups.includes(match));

      const nodesIds = filteredNodes.map(({ _id }) => _id);

      return new GraphData({
        nodes: filteredNodes,
        edges: this.edges
          .filter(({ source, target }) =>
            nodesIds.includes(source) && nodesIds.includes(target)),
      });
    }

    return this;
  }

  filterByProductionType(match) {
    if (match && match !== 'Todos') {
      return new GraphData({
        nodes: this.nodes,
        edges: this.edges
          .reduce((filteredEdges, edge) => {
            const { productions } = edge;
            const filteredProductions = productions
              .filter(({ type }) => type === match);

            if (filteredProductions.length) {
              return [
                ...filteredEdges,
                {
                  ...edge,
                  productions: filteredProductions,
                  weight: filteredProductions.length,
                },
              ];
            }

            return filteredEdges;
          }, []),
      });
    }

    return this;
  }

  removeNodesWithoutEdges() {
    const nodesIds = this.edges
      .reduce((set, { source, target }) =>
        new Set([...set, source, target]), new Set());

    return new GraphData({
      nodes: this.nodes.filter(({ _id }) => nodesIds.has(_id)),
      edges: this.edges,
    });
  }

  insertSelectField(ids) {
    return new GraphData({
      nodes: this.nodes.map((node) => {
        const { _id } = node;

        if (ids.includes(_id)) {
          return { ...node, select: true };
        }
        return { ...node, select: false };
      }),
      edges: this.edges,
    });
  }
}

export default GraphData;
