number   = 42
opposite = true

number = -42 if opposite

squareFn = (x) -> x * x

list = [1, 2, 3, 4, 5]

math =
  root:   Math.sqrt
  square: squareFn
  cube:   (x) -> x * square x

race = (winner, runners...) ->
  print winner, runners

alert "I knew it!" if elvis?
