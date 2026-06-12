FROM nginx:alpine
COPY . /usr/share/nginx/html
# Normalize read perms: some source files are 0600 on disk (e.g. index.html),
# which the unprivileged nginx worker cannot read -> 403. Make the static tree
# world-readable (dirs traversable) so every Host/page serves regardless of
# the host-side file mode.
RUN chmod -R a+rX /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
