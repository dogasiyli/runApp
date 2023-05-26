import pandas as pd
import numpy as np
from geo_funcs import calc_geodesic
import matplotlib.pyplot as plt
import seaborn as sns


def calculate_distances_speeds(all_data, threshold):
    N = len(all_data)
    distances = np.nan*np.ones((N, N))
    speeds = np.nan*np.ones((N, N))

    for i in range(len(all_data) - 2):
        for j in range(i+1, len(all_data)-1):
            p1, p2 = all_data[i], all_data[j]
            time_diff = (p2['timestamp'] - p1['timestamp']) / 1000

            if time_diff > threshold:
                distance = None
                speed = None
            else:
                # Calculate distance between two points
                results = calc_geodesic(p1, p2)
                # Calculate speed in km/h
                distance = results["s_geo_len"]
                speed = results["kmh"]

            distances[i, j] = distance
            speeds[i, j] = speed

    # Create Pandas DataFrames
    distances_df = pd.DataFrame(distances)
    speeds_df = pd.DataFrame(speeds)

    return distances_df, speeds_df

def plot_dataframe_heat_map(df_square, figure_size=(11, 9), title=None):
    # Set up the matplotlib figure
    f, ax = plt.subplots(figsize=figure_size)
    # Generate a custom diverging colormap
    v_min = df_square.min().min()
    v_max = df_square.max().max()    
    cmap = sns.diverging_palette(h_neg=v_max, h_pos=v_min, as_cmap=True)
    # Add title if given
    if title:
        ax.set_title(title)
    # Draw the heatmap with the mask and correct aspect ratio
    sns.heatmap(df_square, cmap=cmap, center=0, square=True, linewidths=.5, cbar_kws={"shrink": .5})
    plt.show()

def calculate_block_stats(df_square, W):
    N = df_square.shape[0]
    V = np.empty(N)
    M = np.empty(N)
    for i in range(N):
        if i < W // 2 or i >= N - W // 2:
            V[i] = np.nan
            M[i] = np.nan
        else:
            block = df_square.iloc[i - W // 2: i + W // 2 + 1, i - W // 2: i + W // 2 + 1]
            V[i] = np.nanvar(block)
            M[i] = np.nanmean(block)

    return V, M

def calc_mean_changes(X, W, tresh, verbose=False):
    last_meaningful_X_idx = np.where(~np.isnan(X))[0][-1]
    # Take the mean values of each W window
    X_mean = np.convolve(X, np.ones(W)/W, mode='same')

    # Take the consequent difference of the mean values
    X_change_val = np.diff(X_mean)

    # Find the indexes where the sign changes
    X_changes_at = np.argwhere(np.diff(2*((X_change_val>=0)-0.5))!=0.0).squeeze()+1

    # Insert the first and last indexes
    X_changes_at = np.insert(X_changes_at, 0, 0)
    X_changes_at = np.append(X_changes_at, last_meaningful_X_idx)

    # Remove the values where the change is less than "treshold"
    consequent_changes = np.abs(np.diff(X[X_changes_at])) 
    keep_idx = np.argwhere(consequent_changes > tresh["min"]).squeeze()

    # Insert the first and last indexes
    keep_idx = np.insert(keep_idx, 0, 0)
    keep_idx = np.append(keep_idx, len(X_changes_at)-1)
    keep_idx = np.sort(np.unique(keep_idx))

    if verbose:
        print("keep_idx =", keep_idx)

    # Update the X_changes_at array
    X_changes_at = X_changes_at[keep_idx]

    # Check the difference between consecutive values and add middle value if it exceeds threshold2
    diff = np.abs(np.diff(X[X_changes_at]))
    add_idx = np.argwhere(diff > tresh["max"]).squeeze()
    for idx in add_idx:
        if verbose:
            print(f"idx:{idx}, idx_between:{X_changes_at[idx]},{X_changes_at[idx+1]} ")
        X_changes_at = np.append(X_changes_at, (X_changes_at[idx] + X_changes_at[idx+1]) // 2)
    X_changes_at = np.sort(np.unique(X_changes_at))

    if verbose:
        print("The changes to plot at idx after treshold keep =", X_changes_at)
        print("Diff of consecutive idx =", np.diff(X_changes_at))

    return X_changes_at, X_mean

def plot_block_stats(df_square, W, 
                     mean_change_treshold={"var":{"min":0.2,"max":0.3},"mean":{"min":1, "max":2}}, 
                     figure_size=(10, 5), titlestr="",
                     verbose=False):
    V, M = calculate_block_stats(df_square, W)
    N = len(V)
    plt.figure(figsize=figure_size)
    plt.title(titlestr)
    #plt.plot(V, color='orange', label="Variance")
    plt.plot(M, color='blue', label="Mean", alpha=0.3)
    
    #mean_changes_V = calc_mean_changes(V, W, tresh=mean_change_treshold["var"], verbose=verbose)
    mean_changes_M, mean_M = calc_mean_changes(M, W, tresh=mean_change_treshold["mean"], verbose=verbose)
    plt.plot(mean_M, color='blue', label="MeanMean")
    #for i in mean_changes_V:
    #    if np.isfinite(V[i]):
    #        plt.text(i, V[i], f"{V[i]:.2f}", color='orange', ha='center', va='bottom', rotation=45)
    for i in mean_changes_M:
        if np.isfinite(M[i]):
            plt.text(i, M[i], f"{M[i]:.2f}", color='blue', ha='center', va='bottom', rotation=0)
            plt.plot([i,i], [0, mean_M[i]], color='grey', alpha=0.5)
    
    plt.legend()

    # Add mean lines for V and M
    #V_mean = np.nanmean(V)
    M_mean = np.nanmean(M)
    #plt.hlines(y=V_mean, xmin=0, xmax=len(V)-1, color='orange', linewidth=2, alpha=0.5)
    #plt.text(N, V_mean, f"Av.Var:{V_mean:.2f}", color='orange', ha='center', va='bottom', rotation=45)
    plt.hlines(y=M_mean, xmin=0, xmax=len(M)-1, color='blue', linewidth=2, alpha=0.5)
    plt.text(N, M_mean, f"Av.Mean:{M_mean:.2f}", color='blue', ha='center', va='bottom', rotation=45)
    plt.xticks(np.arange(0,N,5), rotation=45)
    plt.xlabel("time Index")
    plt.ylabel("Speed")

    plt.show()