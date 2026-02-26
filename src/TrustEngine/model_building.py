import tensorflow as tf #type:ignore
from tensorflow.keras.layers import Input, Dense, Dropout, Bidirectional, GRU, Layer #type:ignore
from tensorflow.keras.models import Model #type:ignore
 

class AttentionLayer(Layer):

    def build(self, input_shape):
        self.W = self.add_weight(
            shape=(input_shape[-1], input_shape[-1]),
            initializer="glorot_uniform"
        )
        self.u = self.add_weight(
            shape=(input_shape[-1], 1),
            initializer="glorot_uniform"
        )

    def call(self, inputs):
        score = tf.tanh(tf.tensordot(inputs, self.W, axes=1))
        weights = tf.nn.softmax(tf.tensordot(score, self.u, axes=1), axis=1)
        context = tf.reduce_sum(weights * inputs, axis=1)
        return context


class ModelBuilder:

    def build(self, time_steps, feature_dim):

        inputs = Input(shape=(time_steps, feature_dim))

        x = Bidirectional(GRU(128, return_sequences=True))(inputs)
        x = AttentionLayer()(x)

        x = Dense(64, activation="relu")(x)
        x = Dropout(0.3)(x)

        outputs = Dense(1, activation="sigmoid")(x)

        model = Model(inputs, outputs)

        model.compile(
            optimizer="adam",
            loss="binary_crossentropy",
            metrics=["accuracy", tf.keras.metrics.AUC()]
        )

        return model