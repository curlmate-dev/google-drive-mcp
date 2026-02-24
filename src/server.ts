import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";

const CURLMATE_BASE_URL = "https://api.curlmate.dev";

const zAccessTokenResponse = z.object({
  accessToken: z.string()
})

const getAccessToken = async({jwt, connection}: {jwt: string | undefined, connection: string | undefined}) : Promise<{accessToken: string} | { error: string, status: number }> => {
  if (!jwt) {
    return {
      error: "Missing JWT token in Authorization header",
      status: 401
    }
  }
  if (!connection) {
    return {
      error: "Missing x-connection header",
      status: 400
    }
  }
  const response = await fetch(`${CURLMATE_BASE_URL}/token`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${jwt}`,
      "x-connection": connection
    }
  })

  if (!response.ok) {
    return {
      error: await response.text(),
      status: response.status
    }
  }

  const data = zAccessTokenResponse.parse(await response.json());
  return {
    accessToken: data.accessToken
  }
}

export class GoogleDriveMCP extends McpAgent<Env, {}> {
  server = new McpServer({
    name: "google-drive-mcp",
    version: "0.0.1",
  });

  async init() {
    this.server.registerTool(
      "List-All-Files",
      {
        description: "this tool lists all Files of User in Drive",
        inputSchema: { q: z.string() }
      },
      async ({ q }, { requestInfo }) => {
        const params = new URLSearchParams();
        params.set("q", q)

        const jwt = requestInfo?.headers["access-token"] as string
        const connection = requestInfo?.headers["x-connection"] as string | undefined;
        const res = await getAccessToken({jwt, connection});

        if ("error" in res) {
          return {
            content: [
              {
                text: JSON.stringify(res),
                type: "text"
              }
            ]
          }
        }
        const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${res.accessToken}`,
            "Content-Type": "application/json",
          }
        })

        if (!response.ok) {
          return {
            content: [
              {
                text: JSON.stringify(await response.text()),
                type: "text"
              }
            ]
          }
        }

        return {
          content: [
            {
              text: JSON.stringify(await response.json()),
              type: "text"
            }
          ]
        };
      }
    );

    this.server.registerTool(
      "authenticated-user",
      {
        description: "this tool lists the authenticated user",
        inputSchema: { }
      },
      async ({}, {requestInfo}) => {
        const jwt = requestInfo?.headers["access-token"] as string
        const connection = requestInfo?.headers["x-connection"] as string | undefined;
        const res = await getAccessToken({jwt, connection});

        if ("error" in res) {
          return {
            content: [
              {
                text: JSON.stringify(res),
                type: "text"
              }
            ]
          }
        }

        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${res.accessToken}`,
            "Content-Type": "application/json",
          }
        })

        if (!response.ok) {
          return {
            content: [
              {
                text: JSON.stringify(await response.text()),
                type: "text"
              }
            ]
          }
        }

        return {
          content: [
            {
              text: JSON.stringify(await response.json()),
              type: "text"
            }
          ]
        };
      }
    );
  }

  
  onError(_: unknown, error?: unknown): void | Promise<void> {
    console.error("GoogleDrive MCP initialization error:", error);

    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes("counter")) {
        console.error(
          "Failed to initialize counter resource. Please check the counter configuration."
        );
      } else if (error.message.includes("tool")) {
        console.error(
          "Failed to register MCP tools. Please verify tool configurations."
        );
      } else {
        // Fall back to default error handling
        console.error(error);
      }
    }
  }
}

export default {
  fetch(request: Request, env: unknown, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // support both legacy SSE and new streamable-http
    if (url.pathname.startsWith("/sse")) {
      return GoogleDriveMCP.serveSSE("/sse", { binding: "GoogleDriveMCP" }).fetch(
        request,
        env,
        ctx
      );
    }

    if (url.pathname.startsWith("/mcp")) {
      return GoogleDriveMCP.serve("/mcp", { binding: "GoogleDriveMCP" }).fetch(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  }
};
