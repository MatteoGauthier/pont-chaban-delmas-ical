import { Elysia } from "elysia"
import { html } from "@elysiajs/html"
import { swagger } from "@elysiajs/swagger"
import { getBridgeState, generateICalendar } from "./services/bridge-service"
import { renderHomePage } from "./templates/index"

const app = new Elysia().use(html())

app.get("/", async () => {
  try {
    const bridgeState = await getBridgeState()
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
    }

    return calendar
  } catch (error) {
    console.error("Error generating calendar:", error)
    set.status = 500
    return "Error generating calendar"
  }
})

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
app.listen(port)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
