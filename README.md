# Google Drive Remote MCP

This remote MCP Agent runs in wrangler and is deployed to cloudflare worker.
Tools implemented:  
 `list authenticated user`, `list all files`,

 ## Claude Desktop Config
 ```  
     "google-drive": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://google-drive-mcp.curlmate.workers.dev/mcp",
        "--header",
        "access-token: your Google Drive Access Token from https://curlmate.dev"
      ]
    }
  ```

## Instruction

```sh
npm install
npm start
```

This will start an MCP server on `http://localhost:5174/mcp`

Inside your `McpAgent`'s `init()` method, you can define resources, tools, etc:

```ts
export class MyMCP extends McpAgent<Env> {
  server = new McpServer({
    name: "Demo",
    version: "1.0.0"
  });

  async init() {
    this.server.resource("counter", "mcp://resource/counter", (uri) => {
      // ...
    });

    this.server.registerTool(
      "add",
      {
        description: "Add to the counter, stored in the MCP",
        inputSchema: { a: z.number() }
      },
      async ({ a }) => {
        // add your logic here
      }
    );
  }
}
```
# google-drive-mcp
