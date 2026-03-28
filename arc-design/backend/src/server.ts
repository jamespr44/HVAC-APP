import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

import projectRoutes from './routes/projects';
import floorRoutes from './routes/floors';
import systemRoutes from './routes/systems';
import zoneRoutes from './routes/zones';
import calculateRoutes from './routes/calculate';
import equipmentRoutes from './routes/equipment';
import maintenanceRoutes from './routes/maintenance';

app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/floors', floorRoutes);
app.use('/api/projects/:projectId/systems', systemRoutes);
app.use('/api/projects/:projectId/zones', zoneRoutes);
app.use('/api/projects/:projectId/equipment', equipmentRoutes);
app.use('/api/projects/:projectId/equipment', maintenanceRoutes);
app.use('/api/projects/:projectId/calculate', calculateRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
