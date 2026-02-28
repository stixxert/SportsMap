# SportsMap
Sports platforms such as Strava has a sports map for a few select activity types, with limited support for filtering for date ranges.

While they do have the heat map, they do not have the features that allows users to select a specific geographical point, 
and retrieve all activities that has been logged at this coordinate.

## Features
Route `/` requires Strava authentication to use.

Route `/demo` provides a demo, by automatically generating activities and GPS-maps that are API-compatible with the Strava Activities API.

### Filter visible activities
Filter using:
- Activity types (1 or more)
- Date ranges - Year-Month-Date (Select either start and end date, or both)

Updates to the filter will reflect in the activities drawn on the map, as well as those visible in the "selected" activities side-panel.

Preferred filter choices can be saved, which will be re-used the next time you use the app.

### View selected activities
Both of the following mechanisms displays the resulting activities on the right-side panel.
The activity table can be sorted, and contains an aggregated score of the table header columns, 
such as total `Distance`, `Elevation`, and `Moving Time`.

### Query geographical point
Clicking on a point of the map will return all activities that passed this point. This marker can be deleted or resized using the side-panel.
Resizing the marker size allows queries to be more or less sensitive.

### Query geographical bounds
All activities that fit into the screen window dimensions, will be shown in the selected activities-window, 
if a geographical point is not selected.

## Constraints
Runs almost entirely client-side, server is only involved in order to protect the Strava API token.
Meaning that user activities are stored in `IndexedDB`-stores in the web browser, and that the web browser will 
need to keep all geographical activity points in memory, in order to function.

## Technologies
Material UI, Material-react-table, NextJS, Zustand, Leaflet.

The app uses Web Workers for aggregating activity data, in several places:
- Generates GeoJSON segments for the activities chosen by the filter
- Generates a Spatial Index (R-Tree) for all the lines of all activities chosen by the filter, to enable coordinate queries.
- Real-time lookups in the Spatial Index is done in a Web Worker, where the results are handed back to the main thread.

## Future plans
- Avoid the need of keeping the all the users activity bounds in memory. As most users will have activity hot-spots, 
only retaining a portion of the spatial index that accommodates regions of the world, could be beneficial.
- Heat map. I have already experimented with this, but storing the tiles in memory, and calculating and drawing the activity heat tiles is an extreme resource intensive process. Being able to render the tiles according to changing activity filters need to be somewhat fast. 
This feature will see benefit from the aforementioned segmenting the world into discrete regions, and retain mappings that allows us to easily bring these into memory when needed.

## How to use
### Environment variables
Using `.env.template` as an example:
```text
NEXT_PUBLIC_CLIENT_ID=
CLIENT_SECRET=
NEXT_PUBLIC_DOMAIN=
NEXT_PUBLIC_LOCATION_SEARCH_API=
```
Where `CLIENT_ID` and `CLIENT_SECRET` are tokens generated from [Strava](https://developers.strava.com/docs/getting-started/).
The `CLIENT_SECRET` should only remain on the server.

`PUBLIC_DOMAIN` is used for authentication callbacks, and are needed to redirect users back to the app after authentication against Strava.

`LOCATION_SEARCH_API` - Strava profiles may contain general geographical locations where the user resides. 
Using the `LOCATION_SEARCH_API`-endpoint, the app can find the geographical location and bounds of this location. 
In deployment, the public [Nominatim Search API](https://nominatim.openstreetmap.org/search) is used.

# Deployment
- Dev:  `npm run dev`
- Build: `npm run build`
- Start: `npm run start`