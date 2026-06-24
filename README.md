# BFHL — Hierarchical Data Processor

REST API and frontend for processing hierarchical node relationships, detecting cycles, and building tree structures.

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: React, Vite
- **Styling**: Vanilla CSS

## API

### `POST /bfhl`

Accepts an array of node strings (`X->Y` format), processes hierarchical relationships, and returns structured insights.

**Request**
```json
{
  "data": ["A->B", "A->C", "B->D", "C->E", "E->F", "X->Y", "Y->Z", "Z->X"]
}
```

**Response**
```json
{
  "user_id": "aadityakumar_18052005",
  "email_id": "aaditya1003.be23@chitkarauniversity.edu.in",
  "college_roll_number": "2311981003",
  "hierarchies": [
    { "root": "A", "tree": { "A": { "B": { "D": {} }, "C": { "E": {} } } }, "depth": 3 },
    { "root": "X", "tree": {}, "has_cycle": true }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": { "total_trees": 1, "total_cycles": 1, "largest_tree_root": "A" }
}
```

## Project Structure

```
├── server/
│   ├── index.js           # Express server with CORS
│   └── processData.js     # Core processing logic
├── client/
│   ├── src/
│   │   ├── App.jsx        # React frontend
│   │   └── index.css      # Styles
│   └── index.html
└── package.json           # Root scripts for deployment
```

## Run Locally

**Backend**
```bash
cd server
npm install
npm start
```

**Frontend (development)**
```bash
cd client
npm install
npm run dev
```

The frontend dev server proxies `/bfhl` requests to `http://localhost:3000`.

## Deploy

Build the frontend and start the server:

```bash
cd client && npm install && npm run build
cd ../server && npm install && node index.js
```

The Express server serves both the API and the built frontend on a single port.
