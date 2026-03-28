"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = routes;
const auth_1 = require("../auth");
const equipmentLoadCalculator_1 = require("../services/equipmentLoadCalculator");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
function routes(router) {
    // GET /api/projects/:projectId/zones/:zoneId/equipment-loads
    // Returns all equipment assigned to a zone and their calculated loads with diversification
    router.get('/:projectId/zones/:zoneId/equipment-loads', auth_1.verify, async (req, res) => {
        try {
            const { projectId, zoneId } = req.params;
            const orgId = req.user?.orgId;
            if (!orgId || !projectId || !zoneId) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }
            // Verify zone belongs to this org and project
            const zone = await db_1.db
                .select()
                .from(schema_1.zones)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.zones.id, zoneId), (0, drizzle_orm_1.eq)(schema_1.zones.projectId, projectId), (0, drizzle_orm_1.eq)(schema_1.zones.orgId, orgId)))
                .limit(1);
            if (!zone.length) {
                return res.status(404).json({ error: 'Zone not found' });
            }
            const equipmentLoads = await (0, equipmentLoadCalculator_1.getZoneEquipmentLoads)(zoneId, orgId);
            res.json({
                zoneId,
                zoneName: zone[0].name,
                totalSensibleW: equipmentLoads.totalSensibleW,
                totalLatentW: equipmentLoads.totalLatentW,
                totalW: equipmentLoads.totalSensibleW + equipmentLoads.totalLatentW,
                count: equipmentLoads.equipmentBreakdown.length,
                equipmentBreakdown: equipmentLoads.equipmentBreakdown,
            });
        }
        catch (error) {
            console.error('Error fetching zone equipment loads:', error);
            res.status(500).json({ error: 'Failed to fetch equipment loads' });
        }
    });
    return router;
}
