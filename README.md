# File Sharing and Cloud Storage

Create your own fully-featured, self-hosted file sharing and hosting website in minutes (no coding or complex server management required).

Why use this
- Privacy and control: Keep your files on infrastructure you control instead of third-party services.
- Flexible storage: Works with local disk, S3-compatible storage, FTP, SFTP and WebDAV backends.
- Production-ready stack: Built with a modern Laravel backend and a fast React + Vite frontend.
- Feature-rich out of the box: Resumable uploads, multi-driver storage, API (Swagger), jobs/queues and admin tooling.

How it works
- Backend: Laravel provides REST APIs, authentication, background job processing and storage adapter configuration.
- Frontend: React + Vite in resources/ provides the user interface and uses tus-js-client or standard upload flows to send files to the server.
- Storage: Files are stored using Flysystem adapters configured in config/filesystems.php. Jobs handle post-upload processing such as thumbnails, indexing and notifications.
- Monitoring (optional): Export application metrics to Prometheus and visualize them with Grafana for performance and uptime monitoring.

Key features
- Resumable uploads (tus-js-client on the frontend).
- Multiple storage drivers (S3, FTP, SFTP, WebDAV via Flysystem adapters).
- User authentication and APIs (Laravel + Sanctum).
- Background queues, job management and real-time features (Horizon, queue workers, Pusher / Echo).
- Admin and workspace features for teams and individual users.
- Internationalization (server and client translation files included).
- API docs included (public/swagger.yaml).
- Docker compose provided for easy local deployment.

Stack
- Languages: PHP (Laravel) backend, TypeScript + React frontend, HTML views.
- Frameworks / tools:
  - Laravel 12 (backend)
  - React + Vite (frontend)
  - TailwindCSS
  - Redis / queues (via queue workers and Horizon)
- Notable libraries: league/flysystem-* (storage adapters), tus-js-client (resumable uploads), laravel/sanctum, laravel/horizon

Repository layout (top-level)
- app/                 - Laravel application code (Controllers, Models, Services, Workspaces, etc.)
- bootstrap/           - framework bootstrap files
- config/              - Laravel configuration
- database/            - migrations, seeders, factories
- public/              - web root (index.php, assets, swagger.yaml)
- resources/           - frontend assets, views, client/server translations
- routes/              - route definitions
- storage/             - default local storage (not committed)
- sample-files/        - example files used for demos/tests
- docker-compose.yml   - example compose for local development
- env.example          - environment variables template
- package.json         - frontend build & dev scripts
- composer.json        - PHP dependencies and post-create hooks
- changelog.html       - project changelog

Quick start - clone and run
1. Clone the repository:
   git clone https://github.com/Aarif-creator/File-Sharing-and-Cloud-Storage.git
   cd File-Sharing-and-Cloud-Storage

2. Copy env and configure:
   cp .env.example .env
   Edit .env to configure DB, Redis and storage disks.

3. Install dependencies:
   composer install --no-interaction --prefer-dist --optimize-autoloader
   npm install

4. Build frontend and run migrations:
   npm run build
   php artisan key:generate
   php artisan migrate --force
   php artisan storage:link

5. Start services (recommended: Docker Compose):
   docker-compose up -d

6. Useful checks and commands
- Check docker containers and logs:
  docker compose ps
  docker compose logs -f app
- Tail artisan logs:
  php artisan queue:work --tries=3
  php artisan horizon:status
- Check upload limits and PHP info:
  php -i | grep upload_max_filesize
  php -i | grep post_max_size
- Health check endpoint (if available):
  curl -I http://localhost:8000/health

Monitoring with Prometheus and Grafana (optional)
- Overview:
  - Use Prometheus to scrape metrics exported by the PHP/Laravel app or from exporters. Use Grafana to visualize metrics and build dashboards.
- Options:
  - Add a Laravel exporter such as jimwib/laravel-prometheus-exporter or laravel-metrics packages to expose /metrics.
  - Configure Prometheus to scrape the /metrics endpoint.
  - Run Grafana and import dashboards for PHP and Laravel metrics.
- Example docker-compose snippet (add to your docker-compose.yml under services):

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    ports:
      - 9090:9090

  grafana:
    image: grafana/grafana:latest
    ports:
      - 3000:3000
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

  volumes:
    grafana-data:

- Minimal prometheus.yml example (monitoring/prometheus.yml):
  global:
    scrape_interval: 15s
  scrape_configs:
    - job_name: 'app'
      static_configs:
        - targets: ['app:8000']

- After starting Prometheus and Grafana, go to http://localhost:3000 and log in with admin/admin (change password). Add Prometheus as a data source and import dashboards.

Security and production tips
- Set APP_ENV=production and APP_DEBUG=false in production.
- Use HTTPS with a reverse proxy or load balancer and set appropriate CORS and CSP headers.
- Use signed, expiring links for public file access when appropriate.
- Limit upload rates and enable authentication on public endpoints.

Troubleshooting
- Queues not processing: ensure Redis is running and that queue workers or Horizon are started.
- Uploads failing: check storage path permissions and PHP upload limits.
- Frontend assets 404: run npm run build and ensure public/build exists or run npm run dev during development.

Where to look next
- public/swagger.yaml - API docs and example clients
- env.example - all configuration keys required
- changelog.html - release notes and history
- sample-files/ - example content to test uploads and flows

Contributing
- Bug reports and PRs welcome. Follow fork -> branch -> PR and include tests where applicable.
- Run tests with phpunit and ensure linters pass (npm run lint, PHPStan for PHP).

License
- MIT - see composer.json
