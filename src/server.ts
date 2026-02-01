import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";


export class GoogleDriveMCP extends McpAgent<Env, {}> {
  server = new McpServer({
    name: "google-drive-mcp",
    version: "0.0.1",
  });

  async init() {
    // this.server.registerTool(
    //   "get-notion-page-format",
    //   {
    //     description: "get the sample page format",
    //     inputSchema: { }
    //   },
    //   async ({  }) => {

    //     return {
    //       content: [
    //         {
    //           text: JSON.stringify({
    //             "parent": {
    //               "data_source_id": "d9824bdc84454327be8b5b47500af6ce"
    //             },
    //             "icon": {
    //               "emoji": "🥬"
    //             },
    //             "cover": {
    //               "external": {
    //                 "url": "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg"
    //               }
    //             },
    //             "properties": {
    //               "Name": {
    //                 "title": [
    //                   {
    //                     "text": {
    //                       "content": "Tuscan Kale"
    //                     }
    //                   }
    //                 ]
    //               },
    //               "Description": {
    //                 "rich_text": [
    //                   {
    //                     "text": {
    //                       "content": "A dark green leafy vegetable"
    //                     }
    //                   }
    //                 ]
    //               },
    //               "Food group": {
    //                 "select": {
    //                   "name": "Vegetable"
    //                 }
    //               },
    //               "Price": { "number": 2.5 }
    //             },
    //             "children": [
    //               {
    //                 "object": "block",
    //                 "type": "heading_2",
    //                 "heading_2": {
    //                   "rich_text": [{ "type": "text", "text": { "content": "Lacinato kale" } }]
    //                 }
    //               },
    //               {
    //                 "object": "block",
    //                 "type": "paragraph",
    //                 "paragraph": {
    //                   "rich_text": [
    //                     {
    //                       "type": "text",
    //                       "text": {
    //                         "content": "Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.",
    //                         "link": { "url": "https://en.wikipedia.org/wiki/Lacinato_kale" }
    //                       }
    //                     }
    //                   ]
    //                 }
    //               }
    //             ]
    //           }),
    //           type: "text"
    //         }
    //       ]
    //     };
    //   }
    // );
    this.server.registerTool(
      "List-All-Files",
      {
        description: "this tool lists all Files of User in Drive",
        inputSchema: { q: z.string() }
      },
      async ({ q }, { requestInfo }) => {
        const params = new URLSearchParams();
        params.set("q", q)
        const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${requestInfo?.headers["access-token"]}`,
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
    // this.server.registerTool(
    //   "create-notion-page",
    //   {
    //     description: "this tool lists all notion pages",
    //     inputSchema: {  pageData: z.string()}
    //   },
    //   async ({  pageData }, { requestInfo }) => {
    //     const response = await fetch("https://api.notion.com/v1/pages", {
    //       method: "POST",
    //       headers: {
    //         "Authorization": `Bearer ${requestInfo?.headers["access-token"]}`,
    //         "Content-Type": "application/json",
    //         "Notion-Version": "2022-06-28"
    //       },
    //       body: pageData
    //     })

    //     if (!response.ok) {
    //       return {
    //         content: [
    //           {
    //             text: JSON.stringify(await response.text()),
    //             type: "text"
    //           }
    //         ]
    //       }
    //     }

    //     return {
    //       content: [
    //         {
    //           text: JSON.stringify(await response.json()),
    //           type: "text"
    //         }
    //       ]
    //     };
    //   }
    // );
    // this.server.registerTool(
    //   "fetch-notion-page",
    //   {
    //     description: "this tool fetches a notion page",
    //     inputSchema: { pageId: z.string()}
    //   },
    //   async ({ pageId }, { requestInfo }) => {
    //     const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    //       method: "GET",
    //       headers: {
    //         "Authorization": `Bearer ${requestInfo?.headers["access-token"]}`,
    //         "Content-Type": "application/json",
    //         "Notion-Version": "2022-06-28"
    //       }
    //     })

    //     if (!response.ok) {
    //       return {
    //         content: [
    //           {
    //             text: JSON.stringify(await response.text()),
    //             type: "text"
    //           }
    //         ]
    //       }
    //     }

    //     return {
    //       content: [
    //         {
    //           text: JSON.stringify(await response.json()),
    //           type: "text"
    //         }
    //       ]
    //     };
    //   }
    // );
    this.server.registerTool(
      "authenticated-user",
      {
        description: "this tool lists the authenticated user",
        inputSchema: { }
      },
      async ({}, {requestInfo}) => {
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${requestInfo?.headers["access-token"]}`,
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
