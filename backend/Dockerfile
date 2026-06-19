# From https://shaneutt.com/blog/rust-fast-small-docker-image-builds/

# ------------------------------------------------------------------------------
# Cargo Build Stage
# ------------------------------------------------------------------------------

FROM messense/rust-musl-cross:x86_64-musl as cargo-build

WORKDIR /usr/src/reacher

# 1. Copy only manifest files to cache dependencies
COPY Cargo.toml Cargo.lock ./
COPY backend/Cargo.toml backend/
COPY cli/Cargo.toml cli/
COPY core/Cargo.toml core/
COPY sqs/Cargo.toml sqs/

# 2. Create dummy source files
RUN mkdir -p backend/src cli/src core/src sqs/src && \
    echo "fn main() {}" > backend/src/main.rs && \
    echo "fn main() {}" > cli/src/main.rs && \
    echo "fn main() {}" > sqs/src/main.rs && \
    echo "pub fn dummy() {}" > core/src/lib.rs

ENV SQLX_OFFLINE=true

# 3. Build dependencies (this layer will be cached by Docker)
RUN cargo build --jobs 1 --release --target=x86_64-unknown-linux-musl

# 4. Remove dummy build artifacts
RUN rm -rf target/x86_64-unknown-linux-musl/release/deps/reacher* \
           target/x86_64-unknown-linux-musl/release/deps/check_if_email_exists* \
           target/x86_64-unknown-linux-musl/release/reacher*

# 5. Copy the actual source code
COPY . .

# 6. Build the actual backend using 1 CPU core to prevent OOM
RUN cargo build --jobs 1 --bin reacher_backend --release --target=x86_64-unknown-linux-musl

# ------------------------------------------------------------------------------
# Final Stage
# ------------------------------------------------------------------------------

FROM zenika/alpine-chrome:123

WORKDIR /home/reacher/

USER root

# Install chromedriver
# https://github.com/Zenika/alpine-chrome/blob/master/with-chromedriver/Dockerfile
RUN apk add --no-cache chromium-chromedriver

COPY --from=cargo-build /usr/src/reacher/target/x86_64-unknown-linux-musl/release/reacher_backend .
COPY --from=cargo-build /usr/src/reacher/backend/docker.sh .
COPY --from=cargo-build /usr/src/reacher/backend/backend_config.toml .

RUN chown chrome:chrome reacher_backend
RUN chown chrome:chrome docker.sh

# User chrome was created in zenika/alpine-chrome
USER chrome

ENV RUST_LOG=reacher=info
ENV RCH__HTTP_HOST=0.0.0.0
# Currently this Dockerfile is mainly used for single-shot verifications, so we
# disable the worker by default.
ENV RCH__WORKER__ENABLE=false

EXPOSE 8080

# Remove entrypoint from parent Docker file
# https://stackoverflow.com/questions/40122152/how-to-remove-entrypoint-from-parent-image-on-dockerfile
ENTRYPOINT []

CMD ["./docker.sh"]
