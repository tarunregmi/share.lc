import { NetworkInterfaceInfo, networkInterfaces } from 'node:os';

/**
 * @returns `IPv4` of your machine.
 */
export default function getIPv4(): string | undefined {
  const netInterfaces = networkInterfaces();
  const v4Interfaces: NetworkInterfaceInfo[] = [];

  for (const key in netInterfaces) {
    const infs = netInterfaces[key]!;
    v4Interfaces.push(...infs?.filter((inf) => inf.family === 'IPv4' && inf.internal === false));
  }

  return v4Interfaces[0]?.address;
}
