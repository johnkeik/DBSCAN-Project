import pandas as pd
import matplotlib.pyplot as plt
from pandas.plotting import parallel_coordinates
import sys

dataSetFilePath = sys.argv[1]
outputFilePath = sys.argv[2]
columns = sys.argv[3].split(',')

dataset = pd.read_csv(dataSetFilePath)

parallel_coordinates(dataset, 'cluster', cols=columns, colormap='tab10', linewidth=2)

fig = plt.gcf()
if(len(columns)<=20):
    fig.set_size_inches((9, 5), forward=False)    
if(len(columns)<=30):
    fig.set_size_inches((11, 6), forward=False)      
if(len(columns)>30):
    fig.set_size_inches((15,7), forward=False)


plt.savefig(outputFilePath)
