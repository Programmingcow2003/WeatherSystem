import java.util.Random;
import java.net.URL;
import java.net.HttpURLConnection;
import java.io.OutputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class Sensor
{
   public static void main(String[] args)
   {
      try
      {
         Random rand = new Random();
         double signalStrength = rand.nextDouble() * 10;

         // Now stores 100 readings
         double[] voltage = new double[100];

         for(int j = 0; j < 3; j++)
         {

              for(int i = 0; i < 100; i++)
              {
                  int failed_odds = 0;

                  double change = -0.5 + rand.nextDouble();
                  signalStrength += change;

                  if(signalStrength > 10)
                    signalStrength = 10;

                  if(signalStrength < 0)
                    signalStrength = 0;

                  voltage[i] = signalStrength;

                  System.out.println(signalStrength);

                  failed_odds = rand.nextInt(1, 11);

                  if(failed_odds == 10)
                    System.out.println("Previous signal failed to send, resending " + signalStrength);
              }

              // Build JSON automatically
              StringBuilder jsonBuilder = new StringBuilder();
              jsonBuilder.append("{ \"voltage\": [");

              for(int i = 0; i < voltage.length; i++)
              {
                  jsonBuilder.append(voltage[i]);

                  if(i < voltage.length - 1)
                      jsonBuilder.append(", ");
              }

              jsonBuilder.append("], \"amount\": 2 }");

              String json = jsonBuilder.toString();

              URL url = new URL("http://localhost:3000/sample");
              HttpURLConnection con = (HttpURLConnection) url.openConnection();

              con.setRequestMethod("POST");
              con.setRequestProperty("Content-Type", "application/json");
              con.setDoOutput(true);

              OutputStream os = con.getOutputStream();
              os.write(json.getBytes());
              os.flush();
              os.close();

              BufferedReader in = new BufferedReader(
                    new InputStreamReader(con.getInputStream()));

              String inputLine;
              StringBuilder response = new StringBuilder();

              while((inputLine = in.readLine()) != null)
              {
                  response.append(inputLine);
              }

              in.close();

              System.out.println("The JSON is " + json);
              System.out.println("Sampler Response: " + response.toString());
         }

      }
      catch(Exception e)
      {
         e.printStackTrace();
      }
   }
}