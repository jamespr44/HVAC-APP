"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.psychro = void 0;
const psychrolib_1 = require("psychrolib");
const psychro = new psychrolib_1.Psychrometrics();
exports.psychro = psychro;
psychro.SetUnitSystem(psychro.SI);
