import os
import numpy as np
import json
from datetime import datetime

import matplotlib.pyplot as plt
from matplotlib.cm import get_cmap
from matplotlib.cm import ScalarMappable
from mpl_toolkits.mplot3d import Axes3D

from datetime import datetime

def convert_timestamps(timestamps):
    ident_list = "YmdHMSf"
    X = {}
    len_arr = np.zeros(len(ident_list))

    for idx, l in enumerate(ident_list):
        X[l] = [datetime.fromtimestamp(ts / 1000).strftime(f'%{l}') for ts in timestamps]    
        len_arr[idx] = len(np.unique(X[l]))

    first_nonzero_idx = next((index for index, value in enumerate(len_arr) if value > 1), None)
    final_format = '%Y-%m-%d %H:%M:%S.%f'
    first_nonzero_char_ident = f'%{ident_list[first_nonzero_idx]}'

    format_break_point_idx = final_format.index(first_nonzero_char_ident) if first_nonzero_char_ident in final_format else None
    title_format = final_format[:format_break_point_idx-1]
    timestamp_format = final_format[format_break_point_idx:]
    
    formatted_title = f"values@({datetime.fromtimestamp(timestamps[0] / 1000).strftime(title_format)})"
    formatted_timestamps = [datetime.fromtimestamp(ts / 1000).strftime(timestamp_format)[:-3] for ts in timestamps]
    return formatted_title, formatted_timestamps, timestamp_format

def get_plottable_files(folders_to_look_into, dbg_level=1):
    found_file_paths = []

    for folder_name in folders_to_look_into:
        folder_path = os.path.abspath(folder_name)

        if os.path.exists(folder_path) and os.path.isdir(folder_path):
            for file_name in os.listdir(folder_path):
                if file_name.startswith("runPositions") and file_name.endswith(".txt"):
                    file_path = os.path.join(folder_path, file_name)
                    found_file_paths.append(file_path)
                    if dbg_level>=2:
                        print(f"I found {file_name} in {folder_path}")
        elif dbg_level>=2:
            print(f"The folder {folder_path} doesn't exist.")

    if dbg_level>=1:
        for idx, p in enumerate(found_file_paths):
            print(f"idx({idx}):{p}")

    return found_file_paths

def plot_gps_loc(ax, longitudes, latitudes, accuracies):
    # Plot the GPS locations as scatter markers
    s = 2*accuracies
    scatter = ax.scatter(longitudes, latitudes, c=accuracies, cmap='viridis', s=s)

    # Add a colorbar to show the accuracy scale
    cbar = plt.colorbar(scatter, ax=ax)
    cbar.set_label('Accuracy')

    # Set the grid limits based on the minimum and maximum coordinates
    ax.set_xlim(min(longitudes), max(longitudes))
    ax.set_ylim(min(latitudes), max(latitudes))

    # Set labels and title
    ax.set_xlabel('Longitude')
    ax.set_ylabel('Latitude')
    ax.set_title('GPS Locations')

def plot_gps_loc_3D(ax, longitudes, latitudes, accuracies, timestamps, elev=45, azim=-120):   
    # Plot the GPS locations as scatter markers
    s = 2 * accuracies
    scatter = ax.scatter(longitudes, latitudes, timestamps, c=accuracies, cmap='viridis', s=s)

    # Add a colorbar to show the accuracy scale
    cbar = plt.colorbar(scatter, ax=ax)
    cbar.set_label('Accuracy')

    # Set the grid limits based on the minimum and maximum coordinates and timestamps
    ax.set_xlim(min(longitudes), max(longitudes))
    ax.set_ylim(min(latitudes), max(latitudes))
    ax.set_zlim(min(timestamps), max(timestamps))

    # Set labels and title
    ax.set_xlabel('Longitude')
    ax.set_ylabel('Latitude')
    ax.set_zlabel('Timestamp')
    ax.set_title('GPS Locations in 3D')

    # Rotate the view for better visibility
    ax.view_init(elev=elev, azim=azim)

def plot_accuracies(ax, accuracies):
    cmap = 'viridis'
    x = np.arange(len(accuracies))

    ax.bar(x, accuracies, color=get_cmap(cmap)(accuracies / np.max(accuracies)))

    ax.set_xlabel('Index')
    ax.set_ylabel('Accuracy')
    ax.set_title('Accuracy Bar Chart')
    ax.set_xlim(min(x), max(x))

    # Create a ScalarMappable object to generate the colorbar
    sm = ScalarMappable(cmap=cmap)
    sm.set_array(accuracies)
    cbar = plt.colorbar(sm, ax=ax)
    cbar.set_label('Accuracy Value')

def plot_accuracy_timestamps(ax, accuracies, timestamps, stride):
    formatted_title, _, _ = convert_timestamps(timestamps)
    time_diffs = [(ts - timestamps[0]) / 1000 for ts in timestamps]  # Convert to seconds

    ax.plot(time_diffs, accuracies)
    ax.set_xlabel('Time (seconds)')
    ax.set_ylabel('Accuracy')
    ax.set_title(f'Accuracies over Time\n{formatted_title}')
    ax.tick_params(axis='x', rotation=45)
    
     # Set xtick labels with stride
    ax.set_xlim(min(time_diffs), max(time_diffs))
    ax.set_xticks(time_diffs[::stride])
    ax.set_xticklabels(time_diffs[::stride], rotation=45)
    
def plot_accuracy_timestamps_2(ax, accuracies, timestamps, stride, threshold):
    formatted_title, _, _ = convert_timestamps(timestamps)
    time_diffs = [(ts - timestamps[0]) / 1000 for ts in timestamps]  # Convert to seconds

    # Group time differences based on threshold
    groups = []
    current_group = []
    for i in range(len(time_diffs)):
        if time_diffs[i] - time_diffs[i-1] > threshold:
            groups.append(current_group)
            current_group = []
        current_group.append(i)
    groups.append(current_group)

    for group in groups:
        group_time_diffs = [time_diffs[i] for i in group]
        group_accuracies = [accuracies[i] for i in group]
        ax.plot(group_time_diffs, group_accuracies)

    ax.set_xlabel('Time (seconds)')
    ax.set_ylabel('Accuracy')
    ax.set_title(f'Accuracies over Time cut@{threshold} seconds\n{formatted_title}')
    ax.tick_params(axis='x', rotation=45)

    # Set xtick labels with stride
    ax.set_xlim(min(time_diffs), max(time_diffs))
    ax.set_xticks(time_diffs[::stride])
    ax.set_xticklabels(time_diffs[::stride], rotation=45)

def plot_data(full_path_to_txt, figsize=(15, 15), stride=4, threshold=3, hspace=0.5):
    # Read data from the text file
    with open(full_path_to_txt, 'r') as file:
        data = json.load(file)
    data = data[1:]
    
    # Extract latitude, longitude, and accuracy from the data
    latitudes = np.asarray([entry['coords']['latitude'] for entry in data])
    longitudes = np.asarray([entry['coords']['longitude'] for entry in data])
    accuracies = np.asarray([entry['coords']['accuracy'] for entry in data])
    timestamps = np.asarray([entry['timestamp'] for entry in data])

    # Create the figure and axes
    fig = plt.figure(figsize=figsize)
    # Add a new subplot spanning both axes in the second row
    ax0 = fig.add_subplot(321)
    ax1 = fig.add_subplot(322)
    axbig_row2 = fig.add_subplot(312)
    axbig_row3 = fig.add_subplot(313)
    
    
    plot_gps_loc(ax0, longitudes, latitudes, accuracies)
    plot_accuracies(ax1, accuracies)
    plot_accuracy_timestamps(axbig_row2, accuracies, timestamps, stride)
    plot_accuracy_timestamps_2(axbig_row3, accuracies, timestamps, stride, threshold)
    
    # Show the plot
    plt.subplots_adjust(hspace=hspace)
    plt.show()
    return data

def plot_data_3D(full_path_to_txt, figsize=(15, 15), elev=45, azim=-120):
    # Read data from the text file
    with open(full_path_to_txt, 'r') as file:
        data = json.load(file)
    data = data[1:]
    
    # Extract latitude, longitude, and accuracy from the data
    latitudes = np.asarray([entry['coords']['latitude'] for entry in data])
    longitudes = np.asarray([entry['coords']['longitude'] for entry in data])
    accuracies = np.asarray([entry['coords']['accuracy'] for entry in data])
    timestamps = np.asarray([entry['timestamp'] for entry in data])

    # Create the figure and axes
    fig = plt.figure(figsize=figsize)   
    ax = fig.add_subplot(111, projection='3d')
    plot_gps_loc_3D(ax, longitudes, latitudes, accuracies, timestamps, elev, azim)
    plt.show()
    return
    