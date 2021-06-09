interface CrawlerNode {
  url: string;
  isVisited: boolean;
}

interface CrawlerEdge {
  source: CrawlerNode;
  sink: CrawlerNode;
}

interface CrawlerGraph {
  node: CrawlerNode[];
  edges: CrawlerEdge[];
}
