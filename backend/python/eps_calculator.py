import numpy as np
import matplotlib.pyplot as plt
from sklearn.neighbors import NearestNeighbors
import pandas as pd
import sys


dataSetFilePath = sys.argv[1]
firstPlotFileName = sys.argv[2]
k = int(sys.argv[3])
# secondPlotFileName = sys.argv[3]
selected_columns = sys.argv[4].split(',')

# Load the data
dataSet = pd.read_csv(dataSetFilePath)
data = dataSet[selected_columns]


# Add 1 to include the data point itself
neighb = NearestNeighbors(n_neighbors=k+1)
nbrs = neighb.fit(data)
distances, indices = nbrs.kneighbors(data)
# Exclude the first column (distances to the data point itself)
distances = np.sort(distances[:, -1], axis=0)

plt.plot(distances)
plt.xlabel('Index')
plt.ylabel('Distance')
plt.title('Distance to {}th nearest neighbor'.format(k))
plt.savefig(firstPlotFileName)
plt.clf()
# plt.show()

differences = np.diff(distances)
second_derivative = np.diff(differences)
optimal_index = np.argmax(second_derivative) + 1
optimal_eps = distances[optimal_index]

# optional for showing the second plot for knee elbow
# plt.plot(range(1, len(second_derivative) + 1), second_derivative)
# plt.xlabel('Index')
# plt.ylabel('Second Derivative')
# plt.title('Knee/Elbow Detection for k={}'.format(k))
# plt.savefig(secondPlotFileName)
# plt.show()


print(optimal_eps)
