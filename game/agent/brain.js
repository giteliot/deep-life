export function createDeepQNetwork(inputs, unitsArr, numActions) {
  const model = tf.sequential();
  const init = tf.initializers.heUniform();

  model.add(tf.layers.dense(
      {units: unitsArr[0],
       inputShape:[inputs],
       activation:'relu',
       kernelInitializer:init}
    ));

  for (let units of unitsArr.slice(1)) {
    model.add(tf.layers.dense(
      {units: units,
       activation:'relu',
       kernelInitializer:init}
    ));
  }

  model.add(tf.layers.dense(
    {units: numActions,
       activation:'linear'}
    ));
  return model;
}
