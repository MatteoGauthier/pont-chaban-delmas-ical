import { BridgeState } from "../types"
import { getBridgeEventDates } from "../services/bridge-service"
import { Html } from "@elysiajs/html"

function formatDate(date: Date): string {
  return date.toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getBaseUrl(): string {
  // In production, this should be configured properly via environment variables
  return process.env.BASE_URL || "http://localhost:3000"
}

export function renderHomePage(state: BridgeState): JSX.Element {
  const { isElevated, currentEvent, upcomingEvents } = state
  const baseUrl = getBaseUrl()
  const calendarUrl = `${baseUrl}/calendar.ics`
  const webcalUrl = `webcal://${baseUrl.replace(/^https?:\/\//, "")}/calendar.ics`
  const googleCalendarUrl = `https://calendar.google.com/calendar/r/settings/addbyurl?url=${encodeURIComponent(
    calendarUrl
  )}`

  return (
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Pont Chaban-Delmas - État actuel</title>
        <link rel="stylesheet" href="https://unpkg.com/7.css" />
        <style>{`
          body, html { 
            padding: 10px; 
            font-family: 'Tahoma', sans-serif;
            max-width: 100%;
            overflow-x: hidden;
            background-image: url('https://media-hosting.imagekit.io/628843bfce6b4946/image.avif?Expires=1838912741&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=A4dnCKCdx8sGQQhKhnbYMMwj0xgT-G8DQtuRRscLR0gKIVNh7zP4O1MmV5~wrWzGGGXOWXE7WAMkC69tcv93y9Jb4lV4KX2xMrTzNJYOvQCUN--zhMxtiV~jnaUds5oUNcQaDV3O5SmMkPwGU7G41cgaiCT1AZuYTTdz-kLHPzqtKGLAhr~uZA-OyWRJ~OYiLXdnzSubWkr934BD8VwkXOpUmDXHqaw07gXY3qoMGDL4unoOdGwrsLp6hnOmBg7fIKxuKRfRTEBAU0Z-bhb-WTxg7lWZvTYXSv~wUhgplTEStjhIiA9mJRg8r9PTrPdVIZdT0AvHsCrZFa7UoQjsrg__');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
          }
          .window { 
            max-width: 100%; 
            margin: 0 auto;
          }
          .status-box, .upcoming-box, .calendar-box {
            margin-bottom: 1rem;
          }
          .status-box h2 {
            font-size: 1.2em;
            margin-bottom: 0.5rem;
          }
          .status-box p {
            margin: 0.3rem 0;
          }
          .upcoming-box table {
            width: 100%;
            border-collapse: collapse;
          }
          .upcoming-box th, .upcoming-box td {
            padding: 0.4rem;
            text-align: left;
          }
          .calendar-box {
            text-align: center;
          }
          .calendar-box code {
            display: inline-block;
            background-color: #fff;
            padding: 0.2rem 0.5rem;
            border: 1px solid #888;
            word-break: break-all;
            max-width: 100%;
            box-sizing: border-box;
          }
          .calendar-buttons {
            margin-top: 1rem;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            justify-content: center;
          }
          footer {
            margin-top: 2rem;
            text-align: center;
            font-size: 0.9em;
            color: #333;
          }
          
          /* Event cards for mobile view */
          .event-card {
            display: none;
          }
          
          /* Mobile-specific styles */
          @media screen and (max-width: 600px) {
            body {
              padding: 5px;
            }
            
            .window {
              width: 100%;
              box-sizing: border-box;
            }
            
            .upcoming-box table {
              display: none;
            }
            
            .event-card {
              display: block;
              border: 1px solid #d1d1d1;
              border-radius: 2px;
              padding: 0.2rem .5rem;
              margin-bottom: .5rem;
              background-color: #f8f8f8;
            }
            
            .event-card:last-child {
              margin-bottom: 0;
            }
            
            .event-card-row {
              display: flex;
              padding: 0.3rem 0;
            }
            
            .event-card-label {
              flex: 1;
              font-weight: bold;
              min-width: 110px;
            }
            
            .event-card-value {
              flex: 2;
            }
            
            .calendar-buttons {
              flex-direction: column;
              align-items: center;
            }
            
            .calendar-buttons button {
              width: 100%;
              max-width: 250px;
            }
          }

          .container {
            max-width: 640px;
            margin: 0 auto;
          }
        `}</style>
      </head>
      <body>
        <div class="window glass active container">
          <div class="title-bar">
            <div class="title-bar-text">Pont Chaban-Delmas - État Actuel</div>
            <div class="title-bar-controls">
              <button aria-label="Minimize" disabled></button>
              <button aria-label="Maximize" disabled></button>
              <button aria-label="Close" disabled></button>
            </div>
          </div>
          <div class="window-body has-space">
            <div class="status-box">
              <fieldset>
                <legend>État Actuel</legend>
                {isElevated && currentEvent ? (
                  <div>
                    <h2 style={{ color: "red", textAlign: "center" }}>⚠️ Le pont est actuellement fermé ⚠️</h2>
                    <p>
                      <strong>Bateau:</strong> {currentEvent.bateau}
                    </p>
                    <p>
                      <strong>Fermeture:</strong> {formatDate(getBridgeEventDates(currentEvent).startDate)}
                    </p>
                    <p>
                      <strong>Réouverture prévue:</strong> {formatDate(getBridgeEventDates(currentEvent).endDate)}
                    </p>
                    <p>
                      <strong>Type:</strong> {currentEvent.type_de_fermeture}
                    </p>
                  </div>
                ) : (
                  <h2 style={{ color: "green", textAlign: "center" }}>✅ Le pont est ouvert à la circulation</h2>
                )}
              </fieldset>
            </div>

            {upcomingEvents.length > 0 && (
              <div class="upcoming-box">
                <fieldset>
                  <legend>Prochaines fermetures (5 prochaines)</legend>
                  <div role="listview">
                    <table>
                      <thead>
                        <tr>
                          <th>Date de fermeture</th>
                          <th>Date de réouverture</th>
                          <th>Bateau</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingEvents.slice(0, 5).map((event) => {
                          const { startDate, endDate } = getBridgeEventDates(event)
                          return (
                            <tr>
                              <td>{formatDate(startDate)}</td>
                              <td>{formatDate(endDate)}</td>
                              <td safe>{event.bateau}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>

                    {/* Mobile-friendly event cards */}
                    <div class="mobile-event-cards">
                      {upcomingEvents.slice(0, 5).map((event) => {
                        const { startDate, endDate } = getBridgeEventDates(event)
                        return (
                          <div class="event-card">
                            <div class="event-card-row">
                              <div class="event-card-label">Fermeture:</div>
                              <div class="event-card-value">{formatDate(startDate)}</div>
                            </div>
                            <div class="event-card-row">
                              <div class="event-card-label">Réouverture:</div>
                              <div class="event-card-value">{formatDate(endDate)}</div>
                            </div>
                            <div class="event-card-row">
                              <div class="event-card-label">Bateau:</div>
                              <div class="event-card-value" safe>
                                {event.bateau}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </fieldset>
              </div>
            )}

            <div class="calendar-box">
              <fieldset>
                <legend>Ajouter les fermetures à votre calendrier</legend>
                <p>Pour recevoir les mises à jour directement dans votre calendrier, utilisez ce lien :</p>
                <p>
                  <a href={calendarUrl}>
                    <button>Télécharger le calendrier (.ics)</button>
                  </a>
                </p>
                <p>Ou abonnez-vous avec cette URL :</p>
                <p>
                  <code>{calendarUrl}</code>
                </p>
                <div class="calendar-buttons">
                  <a href={webcalUrl}>
                    <button>Ajouter à Apple Calendar</button>
                  </a>
                  <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
                    <button>Ajouter à Google Calendar</button>
                  </a>
                </div>
              </fieldset>
            </div>

            <footer>
              <p>
                Données fournies par{" "}
                <a href="https://datahub.bordeaux-metropole.fr" target="_blank" rel="noopener noreferrer">
                  Bordeaux Métropole
                </a>
                .
              </p>
              <p>
                Créé par{" "}
                <a
                  href="https://github.com/MatteoGauthier/pont-chaban-delmas-ical"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mattèo Gauthier
                </a>{" "}
                avec l'aide des technos{" "}
                <a href="https://elysiajs.com" target="_blank" rel="noopener noreferrer">
                  ElysiaJS
                </a>{" "}
                et{" "}
                <a href="https://github.com/khang-nd/7.css" target="_blank" rel="noopener noreferrer">
                  7.css
                </a>
              </p>

              <p>Dernière mise à jour: {new Date().toLocaleString("fr-FR")}</p>
            </footer>
          </div>
        </div>
      </body>
    </html>
  )
}
