# https://scikit-learn.org/stable/modules/generated/sklearn.cluster.DBSCAN.html

from sklearn.neighbors import NearestNeighbors  # importing the library
from sklearn.cluster import DBSCAN
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from pandas.plotting import parallel_coordinates
import sys

dataSetFilePath = sys.argv[1]
generatedDatasetFilePath = sys.argv[2]
epsilon = float(sys.argv[3])
min_samples = int(sys.argv[4])
columns = sys.argv[5].split(',')


dataset = pd.read_csv(dataSetFilePath)
data = dataset.iloc[:, 0:-1]


dbscan = DBSCAN(eps=epsilon, min_samples=min_samples)
dbscan.fit(data)

dataset['cluster'] = dbscan.labels_.tolist()

# sns.scatterplot(x='sepal.length', y='sepal.width',
#                 hue='cluster', data=dataset, color='blue')
# plt.savefig('scatterplot.png')
# plt.show()

# print(dataset)
dataset.to_csv(generatedDatasetFilePath)

# df2 = pd.DataFrame(dataset, columns=columns)
# df2['Clusters'] = dbscan.labels_
# print(df2)
# parallel_coordinates(df2, 'Clusters', color=(
#     'red', 'blue', 'green', "yellow", "black"))
# plt.show()
