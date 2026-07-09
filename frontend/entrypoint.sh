#!/bin/sh
# Extract the system's DNS resolver IP address from /etc/resolv.conf
export DNS_RESOLVER=$(grep -i nameserver /etc/resolv.conf | head -n1 | cut -d ' ' -f2)

# If no resolver is found, fall back to Google's public DNS
if [ -z "$DNS_RESOLVER" ]; then
  export DNS_RESOLVER="8.8.8.8"
fi

echo "Detected DNS resolver: $DNS_RESOLVER"

# Execute the original Nginx entrypoint script
exec /docker-entrypoint.sh "$@"
