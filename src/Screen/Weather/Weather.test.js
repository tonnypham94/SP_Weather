import { TestWeather } from './index'

describe('Test function', () => {
    it('sum', () => {
        expect(TestWeather.sum(1, 2)).toBe(3);
    })
})