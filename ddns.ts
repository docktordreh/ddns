#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read

import njalla from "npm:njalla-dns@2.0.3";
const domain = Deno.env.get("DDNS_DOMAIN");
const dns = njalla(Deno.env.get("DDNS_API_KEY"));
const domains = await dns.getDomains();
const domainParts = domain.split(".");
const domainRoot = domainParts.slice(-2).join(".");
const domainName = domainParts.slice(0,-2).join(".") || "@";

console.log(domains)

