export function createDeepQNetwork(inputs, unitsArr, numActions) {
  const model = tf.sequential();
  const init = tf.initializers.heUniform();

  for (let units of unitsArr) {
    model.add(tf.layers.dense(
      {units: units,
       inputShape:[inputs],
       activation:'relu',
       kernelInitializer:init}
    ));
  }
  model.add(tf.layers.dense(

    {units: numActions,
       activation:'linear'
     }
    ));
  return model;
}
