import { test, expect } from '@playwright/test';

const markup = '<h1>Heading</h1><h2>Heading</h2><h3>Heading</h3><h4>Heading</h4><h5>Heading</h5><h6>Heading</h6><button class="uif-button">Action</button><div class="uif-input-field"><input class="uif-input"></div><select class="uif-select"><option>Choice</option></select><textarea class="uif-textarea"></textarea><button class="uif-tab">Tab</button>';
const properties = ['fontSize','lineHeight','fontWeight','paddingTop','paddingBottom','paddingLeft','paddingRight','minHeight'];
for (const width of [320, 1200]) for (const rootSize of [16,20]) {
  test(`Base shares Brand A geometry at ${width}px / root ${rootSize}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const capture = async css => {
      await page.route('**/__base-geometry', route => route.fulfill({ contentType:'text/html', body:`<!doctype html><html data-brand="a" data-scheme="light" style="font-size:${rootSize}px"><head><link rel="stylesheet" href="/vendor/ui-foundations/${css}"></head><body>${markup}</body></html>` }));
      await page.goto('/__base-geometry');
      return page.evaluate(properties => {
        const read = selector => { const s=getComputedStyle(document.querySelector(selector)); return Object.fromEntries(properties.map(p => [p,s[p]])); };
        return Object.fromEntries(['h1','h2','h3','h4','h5','h6','.uif-button','.uif-input-field','.uif-input','.uif-select','.uif-textarea','.uif-tab'].map(s=>[s,read(s)]));
      }, properties);
    };
    const brand = await capture('main.css');
    const base = await capture('base.css');
    for (const selector of ['h1','h2','h3','h4','h5','h6','.uif-button','.uif-select','.uif-textarea','.uif-tab']) { const actual = { ...base[selector] }, expected = { ...brand[selector] }; if(selector === '.uif-select') { delete actual.lineHeight; delete expected.lineHeight; delete actual.minHeight; delete expected.minHeight; } expect(actual,selector).toEqual(expected); }
    for (const p of ['fontSize','lineHeight','fontWeight','paddingTop','paddingBottom','paddingLeft','paddingRight']) expect(base['.uif-input'][p],`input ${p}`).toEqual(brand['.uif-input-field'][p]);
    expect(await page.locator('body').evaluate(e=>getComputedStyle(e).fontFamily)).toBe('system-ui, sans-serif');
  });
}
