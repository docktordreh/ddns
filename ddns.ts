#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read

import njalla from "npm:njalla-dns@2.0.3";

const domain = Deno.env.get("DDNS_DOMAIN");
const dns = njalla(Deno.env.get("DDNS_API_KEY"));
const records = await dns.getRecords(domain);

const domainParts = domain.split(".");
const domainRoot = domainParts.slice(-2).join(".");
const domainName = domainParts.slice(0,-2).join(".") || "@";

const pub_ip_provider = "https://api64.ipify.org?format=json"

let pub_ip = await fetch(pub_ip_provider)
if (!pub_ip.ok) {
	throw new Error(`Failed to fetch pub Ip from ${pub_ip_provider}`)
}
pub_ip = await pub_ip.json()
pub_ip = pub_ip["ip"]
const record_ip = records.find((r) => r.type === 'AAAA')["content"]
if (pub_ip === record_ip) {
	console.log(`don't have to update ip. ${record_ip} === ${pub_ip}`)
	Deno.exit(0)
}
console.log(`updating record ip. record: ${record_ip} !== public: ${pub_ip}`)
await dns.update(domain, records.find((r) => r.type === 'AAAA'), {content: pub_ip})
console.log(`updated A-record for ${domain} to ${pub_ip}`)
