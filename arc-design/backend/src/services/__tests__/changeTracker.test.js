"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const changeTracker_1 = require("../changeTracker");
describe('Change Tracker', () => {
    describe('diffObjects', () => {
        it('returns empty diff when objects are identical', () => {
            const obj1 = { name: 'Zone A', area: 100 };
            const obj2 = { name: 'Zone A', area: 100 };
            const diff = (0, changeTracker_1.diffObjects)(obj1, obj2);
            expect(Object.keys(diff)).toHaveLength(0);
        });
        it('identifies added fields', () => {
            const obj1 = { name: 'Zone A' };
            const obj2 = { name: 'Zone A', area: 100 };
            const diff = (0, changeTracker_1.diffObjects)(obj1, obj2);
            expect(diff.area).toEqual({ from: undefined, to: 100 });
        });
        it('identifies changed fields', () => {
            const obj1 = { name: 'Zone A', area: 50 };
            const obj2 = { name: 'Zone A', area: 100 };
            const diff = (0, changeTracker_1.diffObjects)(obj1, obj2);
            expect(diff.area).toEqual({ from: 50, to: 100 });
        });
        it('identifies removed fields', () => {
            const obj1 = { name: 'Zone A', area: 100 };
            const obj2 = { name: 'Zone A' };
            const diff = (0, changeTracker_1.diffObjects)(obj1, obj2);
            expect(diff.area).toEqual({ from: 100, to: undefined });
        });
        it('handles null values', () => {
            const obj1 = { name: 'Zone A', notes: null };
            const obj2 = { name: 'Zone A', notes: 'Some notes' };
            const diff = (0, changeTracker_1.diffObjects)(obj1, obj2);
            expect(diff.notes).toEqual({ from: null, to: 'Some notes' });
        });
        it('handles complex types', () => {
            const obj1 = { config: { level: 1 } };
            const obj2 = { config: { level: 2 } };
            const diff = (0, changeTracker_1.diffObjects)(obj1, obj2);
            expect(diff.config).toBeDefined();
        });
    });
    describe('generateChangeSummary', () => {
        it('returns "No changes" for empty diff', () => {
            const summary = (0, changeTracker_1.generateChangeSummary)({});
            expect(summary).toBe('No changes');
        });
        it('generates summary for single change', () => {
            const changes = { area: { from: 50, to: 100 } };
            const summary = (0, changeTracker_1.generateChangeSummary)(changes);
            expect(summary).toContain('area');
            expect(summary).toContain('50→100');
        });
        it('generates summary for multiple changes', () => {
            const changes = {
                area: { from: 50, to: 100 },
                name: { from: 'Old', to: 'New' },
                occupants: { from: 5, to: 10 }
            };
            const summary = (0, changeTracker_1.generateChangeSummary)(changes);
            expect(summary).toContain('area');
            expect(summary).toContain('name');
            expect(summary).toContain('occupants');
        });
        it('limits summary to first 5 changes and adds +N more', () => {
            const changes = {};
            for (let i = 0; i < 10; i++) {
                changes[`field${i}`] = { from: i, to: i + 1 };
            }
            const summary = (0, changeTracker_1.generateChangeSummary)(changes);
            expect(summary).toContain('+5 more');
        });
        it('handles null/undefined values in summary', () => {
            const changes = {
                notes: { from: null, to: 'Added notes' },
                removed: { from: 'old', to: undefined }
            };
            const summary = (0, changeTracker_1.generateChangeSummary)(changes);
            expect(summary).toContain('empty');
            expect(summary).toContain('undefined');
        });
        it('truncates long values to 20 chars', () => {
            const changes = {
                description: { from: 'A very long description', to: 'Another very long one' }
            };
            const summary = (0, changeTracker_1.generateChangeSummary)(changes);
            expect(summary.length).toBeLessThan(150);
        });
        it('handles entity name in summary', () => {
            const changes = { status: { from: 'active', to: 'inactive' } };
            const summary = (0, changeTracker_1.generateChangeSummary)(changes, 'zone');
            expect(summary).toContain('status');
        });
    });
    describe('Equipment Change Tracking', () => {
        it('tracks equipment capacity change', () => {
            const oldEquip = { id: 'eq1', name: 'AHU-01', totalCapacityW: 5000 };
            const newEquip = { id: 'eq1', name: 'AHU-01', totalCapacityW: 6000 };
            const diff = (0, changeTracker_1.diffObjects)(oldEquip, newEquip);
            expect(diff.totalCapacityW).toEqual({ from: 5000, to: 6000 });
            const summary = (0, changeTracker_1.generateChangeSummary)(diff, 'equipment');
            expect(summary).toContain('totalCapacityW');
            expect(summary).toContain('5000→6000');
        });
        it('tracks refrigerant charge change', () => {
            const oldEquip = { id: 'eq1', name: 'AHU-01', refrigerantChargeKg: 3.0 };
            const newEquip = { id: 'eq1', name: 'AHU-01', refrigerantChargeKg: 3.5 };
            const diff = (0, changeTracker_1.diffObjects)(oldEquip, newEquip);
            expect(diff.refrigerantChargeKg).toEqual({ from: 3.0, to: 3.5 });
        });
        it('tracks equipment status change', () => {
            const oldEquip = { id: 'eq1', name: 'AHU-01', inOperation: true };
            const newEquip = { id: 'eq1', name: 'AHU-01', inOperation: false };
            const diff = (0, changeTracker_1.diffObjects)(oldEquip, newEquip);
            expect(diff.inOperation).toEqual({ from: true, to: false });
        });
    });
    describe('Zone Change Tracking', () => {
        it('tracks area change', () => {
            const oldZone = { id: 'z1', name: 'Office A', areaM2: 100 };
            const newZone = { id: 'z1', name: 'Office A', areaM2: 120 };
            const diff = (0, changeTracker_1.diffObjects)(oldZone, newZone);
            expect(diff.areaM2).toEqual({ from: 100, to: 120 });
            const summary = (0, changeTracker_1.generateChangeSummary)(diff, 'zone');
            expect(summary).toContain('areaM2: 100→120');
        });
        it('tracks envelope property change', () => {
            const oldZone = { id: 'z1', name: 'Office A', glassShgc: 0.4 };
            const newZone = { id: 'z1', name: 'Office A', glassShgc: 0.6 };
            const diff = (0, changeTracker_1.diffObjects)(oldZone, newZone);
            expect(diff.glassShgc).toEqual({ from: 0.4, to: 0.6 });
        });
        it('tracks occupancy change', () => {
            const oldZone = { id: 'z1', name: 'Office A', occupants: 5 };
            const newZone = { id: 'z1', name: 'Office A', occupants: 8 };
            const diff = (0, changeTracker_1.diffObjects)(oldZone, newZone);
            expect(diff.occupants).toEqual({ from: 5, to: 8 });
        });
    });
});
