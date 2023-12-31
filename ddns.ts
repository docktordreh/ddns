#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read

import njalla from "npm:njalla-dns@2.0.3";

const ip_ver = Deno.env.get("DDNS_IPVX") ? Deno.env.get("DDNS_IPVX") : "6";
const record_type = ip_ver == "4" ? "A" : "AAAA";
const domain = Deno.env.get("DDNS_DOMAIN");
const dns = njalla(Deno.env.get("DDNS_API_KEY"));
if (!domain) {
	throw new Error(`No domain configured. Use the env var DDNS_DOMAIN`);
}
const records = await dns.getRecords(domain);
if (!records) {
	throw new Error(`Nothing loaded from dns registrar`);
}

const domainParts = domain.split(".");
const domainRoot = domainParts.slice(-2).join(".");
const domainName = domainParts.slice(0,-2).join(".") || "@";

const pub_ip_provider = `https://api${ip_ver}.ipify.org?format=json`

let pub_ip = await fetch(pub_ip_provider)
if (!pub_ip.ok) {
	throw new Error(`Failed to fetch pub Ip from ${pub_ip_provider}`)
}
pub_ip = await pub_ip.json()
pub_ip = pub_ip["ip"]
const record_ip = records.find((r) => r.type === record_type)["content"]
if (pub_ip === record_ip) {
	console.log(`don't have to update ip. ${record_ip} === ${pub_ip}`)
	Deno.exit(0)
}
console.log(`updating record ip. record: ${record_ip} !== public: ${pub_ip}`)
await dns.update(domain, records.find((r) => r.type === record_type), {content: pub_ip})
console.log(`updated ${record_type}-record for ${domain} to ${pub_ip}`)
