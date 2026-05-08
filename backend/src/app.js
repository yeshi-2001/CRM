const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/leads',     require('./routes/leadRoutes'));
app.use('/api/contacts',  require('./routes/contactRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Pipeline history nested under leads
const { getHistory, addHistory } = require('./controllers/pipelineHistoryController');
const authMiddleware = require('./middleware/authMiddleware');
const historyRouter = require('express').Router();
historyRouter.use(authMiddleware);
historyRouter.get('/:id/history',  getHistory);
historyRouter.post('/:id/history', addHistory);
app.use('/api/leads', historyRouter);

app.use(errorHandler);

module.exports = app;
