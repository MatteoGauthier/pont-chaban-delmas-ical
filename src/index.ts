import { Elysia } from "elysia"
import { html } from "@elysiajs/html"
import { swagger } from "@elysiajs/swagger"
import { getBridgeState, generateICalendar, getCacheStatus, wasDataServedFromCache } from "./services/bridge-service"
import { renderHomePage } from "./templates/index"

const app = new Elysia()
  .use(html())
  .use(swagger())

app.get("/", async ({ set }) => {
  try {
    const bridgeState = await getBridgeState()
    
    // Add cache status header
    set.headers = {
      "X-Cache-Status": wasDataServedFromCache() ? "HIT" : "MISS"
    }
    
    return renderHomePage(bridgeState)
  } catch (error) {
    console.error("Error rendering home page:", error)
    return `<html>
      <body>
        <h1>Error</h1>
        <p>Failed to load bridge data. Please try again later.</p>
      </body>
    </html>`
  }
})

app.get("/calendar.ics", async ({ set }) => {
  try {
    const calendar = await generateICalendar()
    set.headers = {
      "Content-Type": "text/calendar",
      "Content-Disposition": "attachment; filename=pont-chaban-delmas.ics",
      "X-Cache-Status": wasDataServedFromCache() ? "HIT" : "MISS"
    }

    return calendar
  } catch (error) {
    console.error("Error generating calendar:", error)
    set.status = 500
    return "Error generating calendar"
  }
})

// Add health check endpoint
app.get("/api/health", () => {
  const status = getCacheStatus()
  return {
    status: "ok",
    cache: status,
    uptime: process.uptime(),
    timestamp: Date.now()
  }
})

// Add state API endpoint with proper error handling
app.get("/api/state", async ({ set }) => {
  try {
    const state = await getBridgeState()
    
    // Add cache status header
    set.headers = {
      "X-Cache-Status": wasDataServedFromCache() ? "HIT" : "MISS"
    }
    
    return state
  } catch (error) {
    console.error("Error fetching bridge state:", error)
    set.status = 503
    return { 
      error: "Service temporarily unavailable", 
      message: "Could not fetch bridge data at this time"
    }
  }
})

// Error handling for 404 routes
app.all("*", ({ set }) => {
  set.status = 404
  return { error: "Not Found" }
})

// Handle process termination gracefully
function handleShutdown() {
  console.log("Server shutting down...")
  process.exit(0)
}

process.on("SIGINT", handleShutdown)
process.on("SIGTERM", handleShutdown)

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
app.listen(port)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
