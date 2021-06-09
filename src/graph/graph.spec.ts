describe('graph tests', () => {
  it.each`
    source | sink   | expected
    ${'a'} | ${'b'} | ${''}
  `('', function ({ url, expected }) {
    
    expect(url).toBe(expected);
  });
});
