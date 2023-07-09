import pandas as pd
from sklearn.cluster import DBSCAN
import sys
# Read the CSV file

df = pd.read_csv(sys.argv[1])

# Extract only numerical columns from the DataFrame
numerical_df = df.select_dtypes(include=['float64', 'int64'])

# Perform DBSCAN clustering
# Adjust the parameters as per your requirement
dbscan = DBSCAN(eps=0.5, min_samples=5)
clusters = dbscan.fit_predict(numerical_df)

# Add the cluster labels to the DataFrame
df['Cluster'] = clusters

# Save the new dataset to a CSV file
output_csv_path = sys.argv[2]  # Updated the file extension to CSV
df.to_csv(output_csv_path, index=False)

print(output_csv_path)
