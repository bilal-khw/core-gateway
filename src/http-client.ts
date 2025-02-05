import axios from 'axios'
import { HttpsProxyAgent } from 'https-proxy-agent'

export function createHttpClient(proxy?: string) {
    proxy = proxy ?? "http://puser01:K4ZN7c7Pth@194.59.170.164:18888";
    const agent = new HttpsProxyAgent(proxy);
    const httpClient = axios.create(
        {
            httpsAgent: agent
        }
    )
    return httpClient;
}
