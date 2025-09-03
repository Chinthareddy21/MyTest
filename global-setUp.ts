import { rimraf } from "rimraf"


export default async function globalSetUp(): Promise<void> {

    /* Clean up previous test allure results */
    await rimraf('./allure-results');
}