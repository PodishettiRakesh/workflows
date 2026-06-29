# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Any

app = FastAPI()

# Allow requests from the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Pipeline(BaseModel):
    nodes: List[Any]
    edges: List[Any]


def is_dag(nodes: list, edges: list) -> bool:
    # Build adjacency list from edges
    node_ids = {n['id'] for n in nodes}
    graph = {node_id: [] for node_id in node_ids}

    for edge in edges:
        src = edge.get('source')
        tgt = edge.get('target')
        if src in graph and tgt in graph:
            graph[src].append(tgt)

    # Kahn's algorithm — topological sort via in-degree
    in_degree = {node_id: 0 for node_id in node_ids}
    for node_id, neighbors in graph.items():
        for neighbor in neighbors:
            in_degree[neighbor] += 1

    # Start with all nodes that have no incoming edges
    queue = [n for n, deg in in_degree.items() if deg == 0]
    visited_count = 0

    while queue:
        node = queue.pop(0)
        visited_count += 1
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    # If we visited every node, there are no cycles → it's a DAG
    return visited_count == len(node_ids)


@app.get('/')
def read_root():
    return {'Ping': 'Pong'}


@app.post('/pipelines/parse')
def parse_pipeline(pipeline: Pipeline):
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    dag = is_dag(pipeline.nodes, pipeline.edges)

    return {
        'num_nodes': num_nodes,
        'num_edges': num_edges,
        'is_dag': dag,
    }