interface CrawlerNode {
  url: string;
  isVisited: boolean;
}

interface CrawlerEdge {
  source: CrawlerNode;
  sink: CrawlerNode;
}

interface CrawlerGraph {
  nodes: CrawlerNode[];
  edges: CrawlerEdge[];
}

class Graph implements CrawlerGraph {
  nodes: CrawlerNode[];
  edges: CrawlerEdge[];

  addEdge(source: string, sink: string) {
    const sinkNode: CrawlerNode = { isVisited: false, url: sink };
    const sourceNode: CrawlerNode = { isVisited: false, url: source };

    if (!this.hasNode(sink)) {
      this.nodes.push(sinkNode);
    }

    if (!this.hasNode(source)) {
      this.nodes.push(sourceNode);
    }

    const edge: CrawlerEdge = { sink: sinkNode, source: sourceNode };
    this.edges.push(edge);

    return edge;
  }

  /**
   * Checks if the node exists
   * @param name the name of the node
   */
  hasNode(name: string) {
    return !!this.nodes.find((it) => it.url === name);
  }
}
