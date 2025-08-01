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
        <title>Calendrier Pont Chaban-Delmas (Bordeaux) - iCal/Google Agenda</title>
        <meta
          name="description"
          content="Ajoutez facilement les fermetures du pont Chaban-Delmas à Bordeaux à votre Google Agenda ou autre calendrier via notre URL iCal auto-synchronisée. Consultez aussi l'état actuel."
        />
        <meta
          property="og:title"
          content="Calendrier des Fermetures du Pont Chaban-Delmas (Bordeaux) - iCal/Google Agenda"
        />
        <meta
          property="og:description"
          content="Abonnez-vous au calendrier iCal des fermetures du pont Chaban-Delmas pour Google Agenda, Apple Calendar, etc. Mises à jour automatiques."
        />
        <meta
          property="og:image"
          content="https://ik.imagekit.io/squale/220v0u000000jmivz65CF_us0iAceRP.jpg?updatedAt=1754059703507"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={baseUrl} />
        <link rel="stylesheet" href="https://unpkg.com/7.css" />
        <link rel="icon" href="https://ik.imagekit.io/squale/icon_hHY-d-8bT.png?updatedAt=1754059834061" type="image/png" />
        <style>{`
        h1, h2, h3, h4, h5, h6 {
          margin-top: 0;
          margin-bottom: 0;
          font-size: 1em;
          font-weight: normal;
          font-style: normal;
          text-align: center;
        }


          html {
            min-height: 100vh; 
            font-family: 'Tahoma', sans-serif;
            max-width: 100%;
            overflow-x: hidden;
          }
          body {
            padding: 10px;
            font-family: 'Tahoma', sans-serif;
            max-width: 100%;
            overflow-x: hidden;
            background-image: url('https://ik.imagekit.io/squale/220v0u000000jmivz65CF_us0iAceRP.jpg?updatedAt=1754059703507');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            
            min-height: 100vh; 
            margin: 0; 
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
          
          
          .event-card {
            display: none;
          }
          
          
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

          .root {
            margin: 20px;
          }
        `}</style>
      </head>
      <body>
        <div class="root">
          <div class="window glass active container">
            <div class="title-bar">
              <div class="title-bar-text">
                <h1>Pont Chaban-Delmas - État & Calendrier (iCal/Google Agenda)</h1>
              </div>
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
                  <legend>
                    <h2>Ajouter les fermetures à votre calendrier</h2>
                  </legend>
                  <p>
                    Pour recevoir les mises à jour directement dans votre calendrier, copiez et abonnez-vous à cette URL
                    :
                  </p>

                  <p>
                    <code
                      onclick={`copyToClipboard('${calendarUrl}', this)`}
                      style={{ cursor: "pointer" }}
                      title="Cliquez pour copier l'URL"
                    >
                      {calendarUrl}
                    </code>
                  </p>
                  <div class="calendar-buttons">
                    <a href={webcalUrl}>
                      <button>Ajouter à Apple Calendar</button>
                    </a>
                    <a
                      href={googleCalendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onclick={`copyToClipboard('${calendarUrl}', this.querySelector('button'))`}
                      title="Cliquez pour copier l'URL et ajouter à Google Calendar"
                    >
                      <button>Ajouter à Google Calendar</button>
                    </a>
                  </div>
                  <span aria-hidden="true" style={{ visibility: "hidden", height: "0px", width: "0px", display: "block" }}>
                    Google Agenda
                  </span>
                  <p>Ou ajouter les événements directement à votre calendrier :</p>
                  <p>
                    <a href={calendarUrl}>
                      <button>Télécharger le calendrier (.ics)</button>
                    </a>
                  </p>
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
        </div>
        <script>
          {`
            function copyToClipboard(text, element) {
              if (!navigator.clipboard) {
                console.error('Clipboard API not available');
                // Consider adding a fallback or alert for older browsers
                return;
              }
              const originalText = element.innerText;
              navigator.clipboard.writeText(text).then(() => {
                element.innerText = 'Copié !';
                setTimeout(() => {
                  element.innerText = originalText;
                }, 1500); // Reset after 1.5 seconds
              }).catch(err => {
                console.error('Failed to copy text: ', err);
                element.innerText = 'Erreur copie';
                 setTimeout(() => {
                  element.innerText = originalText;
                }, 2000);
              });
            }
          `}
        </script>
        <noscript>
          <img src="https://shynet.squale.dev/ingress/1456bbdf-ac79-4891-94c5-22765806a216/pixel.gif" />
        </noscript>
        <script defer src="https://shynet.squale.dev/ingress/1456bbdf-ac79-4891-94c5-22765806a216/script.js"></script>
      </body>
    </html>
  )
}
