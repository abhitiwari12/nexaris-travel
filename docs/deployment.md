# Deployment

Use Docker Compose for local infrastructure and CI validation. Production should inject secrets via the target platform secret manager, run Prisma migrations before API rollout, and serve the web app through Nginx or the platform edge.
