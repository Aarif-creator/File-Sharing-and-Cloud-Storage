# Monitoring diagrams and examples

This folder contains simple images and a short explanation to help people quickly understand how metrics flow from the app to Prometheus and how Grafana visualizes those metrics.

Images

- diagrams/architecture.svg  
  High-level architecture: App -> Prometheus -> Grafana -> User. Use this to explain the components and ports.

- diagrams/dataflow.svg  
  Step-by-step data flow for file uploads and how metrics are produced and scraped.

- screenshots/grafana-mock-dashboard.svg  
  A mock Grafana dashboard image to show typical panels (requests, errors, queue length, disk usage).

How to view

- On GitHub the images will render inline when you open the files or the monitoring/README.md.
- To edit the SVGs, open them in any vector editor (Inkscape, Illustrator) or a text editor for small changes.

What I can do next

- Add a real Grafana dashboard JSON you can import (I can generate panels and queries if your app exposes /metrics).
- Add a simple Laravel exporter example that exposes a /metrics endpoint with common metrics (requests, jobs processed, queue length, disk usage).

Tell me which of the next steps you want and I will add them to the repo.