package expo.modules.countdownnotification

import android.os.CountDownTimer

/**
 * Represents a single active countdown with its timer and notification metadata.
 * Each countdown has its own CountDownTimer instance and notification ID.
 *
 * @property id Unique identifier for this countdown
 * @property targetTimeMs Target time in epoch milliseconds
 * @property title Notification title
 * @property bodyTemplate Body template with {time} placeholder
 * @property channelId Notification channel ID
 * @property smallIcon Small icon resource name
 * @property notificationId Unique integer ID for the notification
 * @property timer The native CountDownTimer instance (null before start)
 */
data class CountdownEntry(
    val id: String,
    val targetTimeMs: Long,
    val title: String,
    val bodyTemplate: String,
    val channelId: String,
    val smallIcon: String,
    val themeType: String,
    val notificationId: Int,
    var timer: CountDownTimer? = null
)

/**
 * Manages multiple concurrent countdown entries.
 * Provides thread-safe operations for adding, removing, and looking up countdowns.
 * Generates unique notification IDs by hashing countdown string IDs.
 */
class CountdownManager {
    private val countdowns = mutableMapOf<String, CountdownEntry>()

    /**
     * Adds or replaces a countdown entry.
     * If a countdown with the same ID already exists, its timer is cancelled first.
     *
     * @param entry The countdown entry to add
     */
    @Synchronized
    fun addOrReplace(entry: CountdownEntry) {
        // Eski timer varsa iptal et
        countdowns[entry.id]?.timer?.cancel()
        countdowns[entry.id] = entry
    }

    /**
     * Gets a countdown entry by its ID.
     *
     * @param id The countdown identifier
     * @return The countdown entry, or null if not found
     */
    @Synchronized
    fun get(id: String): CountdownEntry? = countdowns[id]

    /**
     * Removes a countdown entry and cancels its timer.
     *
     * @param id The countdown identifier to remove
     * @return The removed entry, or null if not found
     */
    @Synchronized
    fun remove(id: String): CountdownEntry? {
        val entry = countdowns.remove(id)
        entry?.timer?.cancel()
        return entry
    }

    /**
     * Cancels all timers and clears all entries.
     */
    @Synchronized
    fun clear() {
        countdowns.values.forEach { it.timer?.cancel() }
        countdowns.clear()
    }

    /**
     * Checks if there are any active countdowns.
     *
     * @return true if no countdowns are active
     */
    @Synchronized
    fun isEmpty(): Boolean = countdowns.isEmpty()

    /**
     * Returns a snapshot of all current countdown entries.
     *
     * @return List of all active countdown entries
     */
    @Synchronized
    fun getAll(): List<CountdownEntry> = countdowns.values.toList()

    companion object {
        /**
         * Generates a stable integer notification ID from a string ID.
         * Uses absolute value of hashCode and adds offset to avoid conflicts with other notifications.
         *
         * @param id String countdown identifier
         * @return Unique integer notification ID
         */
        fun generateNotificationId(id: String): Int {
            // Notifee veya diger bildirim ID'leri ile catismasin
            return (id.hashCode() and 0x7FFFFFFF) + 50000
        }
    }
}
