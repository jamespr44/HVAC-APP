import { Psychrometrics } from 'psychrolib';

const psychro = new Psychrometrics();
psychro.SetUnitSystem(psychro.SI);

export { psychro };
